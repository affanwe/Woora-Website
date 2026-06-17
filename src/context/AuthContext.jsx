"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, runTransaction, setDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [profitData, setProfitData] = useState(null);
  const [returnPayments, setReturnPayments] = useState([]);
  const [shareRequests, setShareRequests] = useState([]);

  // DEMO MODE HELPERS
  const getDemoInvestors = () => JSON.parse(localStorage.getItem('demo_investors') || '[]');
  const saveDemoInvestors = (data) => localStorage.setItem('demo_investors', JSON.stringify(data));
  const getDemoRequests = () => JSON.parse(localStorage.getItem('demo_requests') || '[]');
  const saveDemoRequests = (data) => localStorage.setItem('demo_requests', JSON.stringify(data));
  const getDemoReturnPayments = () => JSON.parse(localStorage.getItem('demo_returnPayments') || '[]');
  const saveDemoReturnPayments = (data) => localStorage.setItem('demo_returnPayments', JSON.stringify(data));

  // Check if Firebase is configured with real credentials
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      console.warn("WOORA Portal running in DEMO MODE. Configure Firebase in .env to connect to live DB.");
      setIsDemoMode(true);
      
      // Load mock session if any
      const savedUser = localStorage.getItem('demo_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser({ email: user.email, uid: user.uid });
        // Fetch current profile from demo database
        const investors = JSON.parse(localStorage.getItem('demo_investors') || '[]');
        const investor = investors.find(inv => inv.email === user.email);
        setUserData(investor || null);
      }
      setLoading(false);
    } else {
      setIsDemoMode(false);
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          // Listen to changes on the investor's document
          const docRef = doc(db, 'investors', user.uid);
          const unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            } else {
              setUserData(null);
            }
            setLoading(false);
          }, (error) => {
            console.error("Error listening to investor data: ", error);
            setLoading(false);
          });
          return () => unsubscribeDoc();
        } else {
          setUserData(null);
          setLoading(false);
        }
      });
      return unsubscribe;
    }
  }, []);

  // Fetch profit data (returnPayments) for logged-in investor
  useEffect(() => {
    if (!userData?.id) {
      setProfitData(null);
      setReturnPayments([]);
      return;
    }

    if (isDemoMode) {
      const allPayments = getDemoReturnPayments();
      const myPayments = allPayments.filter(p => p.investorId === userData.id);
      myPayments.sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month));
      setReturnPayments(myPayments);

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const totalProfit = myPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingProfit = myPayments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.amount || 0), 0);
      const thisMonthPayment = myPayments.find(p => p.month === currentMonth && p.year === currentYear);
      setProfitData({
        totalProfit,
        pendingProfit,
        thisMonthProfit: thisMonthPayment ? thisMonthPayment.amount : 0,
      });
      return;
    }

    // Firebase: query returnPayments where investorId matches
    const q = query(
      collection(db, 'returnPayments'),
      where('investorId', '==', userData.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const payments = [];
      snapshot.forEach((docSnap) => {
        payments.push({ docId: docSnap.id, ...docSnap.data() });
      });
      payments.sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month));
      setReturnPayments(payments);

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const totalProfit = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingProfit = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.amount || 0), 0);
      const thisMonthPayment = payments.find(p => p.month === currentMonth && p.year === currentYear);
      setProfitData({
        totalProfit,
        pendingProfit,
        thisMonthProfit: thisMonthPayment ? thisMonthPayment.amount : 0,
      });
    }, (error) => {
      console.error("Error fetching return payments:", error);
    });

    return () => unsubscribe();
  }, [userData?.id, isDemoMode]);

  // Real-time listener for share requests
  useEffect(() => {
    if (!userData?.id) {
      setShareRequests([]);
      return;
    }

    if (isDemoMode) {
      const allRequests = getDemoRequests();
      const myRequests = allRequests.filter(r => r.investorId === userData.id);
      myRequests.sort((a, b) => new Date(b.dateRequested) - new Date(a.dateRequested));
      setShareRequests(myRequests);
      return;
    }

    // Firebase: listen to shareRequests for this investor
    const q = query(
      collection(db, 'shareRequests'),
      where('investorId', '==', userData.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        requests.push({
          docId: docSnap.id,
          ...data,
          dateRequested: data.dateRequested?.toDate ? data.dateRequested.toDate().toISOString() : data.dateRequested,
        });
      });
      requests.sort((a, b) => new Date(b.dateRequested) - new Date(a.dateRequested));
      setShareRequests(requests);
    }, (error) => {
      console.error("Error fetching share requests:", error);
    });

    return () => unsubscribe();
  }, [userData?.id, isDemoMode]);

  // Sign Up / Register
  async function register(name, email, mobile, password, nid, referredBy) {
    if (isDemoMode) {
      const investors = getDemoInvestors();
      if (investors.find(inv => inv.email === email)) {
        throw new Error("Email already in use.");
      }
      const nextId = String(1001 + investors.length);
      const uid = 'demo_uid_' + Math.random().toString(36).substr(2, 9);

      const newInvestor = {
        uid,
        id: nextId,
        name,
        email,
        mobile,
        nid,
        shares: 0,
        amount: 0,
        investments: [],
        awardedFreeShares: 0,
        referredBy: referredBy || null,
        createdAt: new Date().toISOString()
      };
      
      investors.push(newInvestor);
      saveDemoInvestors(investors);
      
      const userSession = { email, uid };
      localStorage.setItem('demo_user', JSON.stringify(userSession));
      setCurrentUser(userSession);
      setUserData(newInvestor);
      return newInvestor;
    } else {
      // Create user auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Perform Firestore Transaction to generate unique sequential ID
      const counterRef = doc(db, 'metadata', 'counters');
      const investorRef = doc(db, 'investors', user.uid);
      
      await runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(counterRef);
        let nextId = 1001;
        if (counterSnap.exists()) {
          nextId = (counterSnap.data().lastInvestorId || 1000) + 1;
        }
        
        transaction.set(counterRef, { lastInvestorId: nextId }, { merge: true });
        transaction.set(investorRef, {
          id: String(nextId),
          name,
          email,
          mobile,
          nid,
          shares: 0,
          amount: 0,
          investments: [],
          awardedFreeShares: 0,
          referredBy: referredBy || null,
          createdAt: new Date().toISOString()
        });
      });
    }
  }

  // Login
  async function login(email, password) {
    if (isDemoMode) {
      const investors = getDemoInvestors();
      const investor = investors.find(inv => inv.email === email);
      if (!investor) {
        throw new Error("User not found in local demo database.");
      }
      // Demo password is "password" by default for easy testing, or check if it matches
      const userSession = { email, uid: investor.uid };
      localStorage.setItem('demo_user', JSON.stringify(userSession));
      setCurrentUser(userSession);
      setUserData(investor);
      return investor;
    } else {
      return signInWithEmailAndPassword(auth, email, password);
    }
  }

  // Logout
  async function logout() {
    if (isDemoMode) {
      localStorage.removeItem('demo_user');
      setCurrentUser(null);
      setUserData(null);
    } else {
      return signOut(auth);
    }
  }

  // Create share request
  async function requestShares(sharesCount, paymentMethod, trxId) {
    if (!currentUser || !userData) throw new Error("Must be logged in.");

    const amount = sharesCount * 500;
    const dateRequested = new Date().toISOString();

    if (isDemoMode) {
      const requests = getDemoRequests();
      const nextReqId = 'req_' + Math.random().toString(36).substr(2, 9);
      const newRequest = {
        id: nextReqId,
        investorId: userData.id,
        investorName: userData.name,
        sharesCount,
        amount,
        paymentMethod,
        trxId,
        status: 'Pending',
        dateRequested
      };
      requests.push(newRequest);
      saveDemoRequests(requests);

      // Update shareRequests state immediately
      const myRequests = requests.filter(r => r.investorId === userData.id);
      myRequests.sort((a, b) => new Date(b.dateRequested) - new Date(a.dateRequested));
      setShareRequests(myRequests);

      // Add request to local user investments array for instantaneous feedback
      const investors = getDemoInvestors();
      const updatedInvestors = investors.map(inv => {
        if (inv.id === userData.id) {
          const updatedInvestments = [...(inv.investments || []), {
            shares: sharesCount,
            amount,
            joiningDate: dateRequested.split('T')[0],
            status: 'Pending',
            trxId
          }];
          return { ...inv, investments: updatedInvestments };
        }
        return inv;
      });
      saveDemoInvestors(updatedInvestors);
      setUserData(updatedInvestors.find(inv => inv.id === userData.id));

      return newRequest;
    } else {
      // Create request in shareRequests collection
      const newRequestRef = doc(collection(db, 'shareRequests'));
      const newRequest = {
        id: newRequestRef.id,
        investorId: userData.id,
        investorName: userData.name,
        sharesCount,
        amount,
        paymentMethod,
        trxId,
        status: 'Pending',
        dateRequested: new Date() // Store as Firestore Timestamp
      };

      await setDoc(newRequestRef, newRequest);

      // Append pending investment inside the user's investments list for convenience
      const userRef = doc(db, 'investors', currentUser.uid);
      const updatedInvestments = [...(userData.investments || []), {
        shares: sharesCount,
        amount,
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        trxId
      }];
      await setDoc(userRef, { investments: updatedInvestments }, { merge: true });

      return newRequest;
    }
  }

  const value = {
    currentUser,
    userData,
    loading,
    isDemoMode,
    profitData,
    returnPayments,
    shareRequests,
    login,
    register,
    logout,
    requestShares
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
