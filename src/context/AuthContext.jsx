import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, runTransaction, setDoc, addDoc, collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
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

  // Check if Firebase is configured with real credentials
  useEffect(() => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
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

  // DEMO MODE HELPER: Initialize mock data in LocalStorage if not exists
  const getDemoInvestors = () => JSON.parse(localStorage.getItem('demo_investors') || '[]');
  const saveDemoInvestors = (data) => localStorage.setItem('demo_investors', JSON.stringify(data));
  const getDemoRequests = () => JSON.parse(localStorage.getItem('demo_requests') || '[]');
  const saveDemoRequests = (data) => localStorage.setItem('demo_requests', JSON.stringify(data));

  // Sign Up / Register
  async function register(name, email, mobile, password, nid) {
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
