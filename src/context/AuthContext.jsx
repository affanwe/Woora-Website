"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profitData, setProfitData] = useState(null);
  const [returnPayments, setReturnPayments] = useState([]);
  const [shareRequests, setShareRequests] = useState([]);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        const { data: investor } = await supabase
          .from('investors')
          .select('*')
          .eq('uid', user.id)
          .maybeSingle();
        setUserData(investor ? mapInvestor(investor) : null);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        supabase.from('investors').select('*').eq('uid', user.id).maybeSingle()
          .then(({ data: investor }) => {
            setUserData(investor ? mapInvestor(investor) : null);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapInvestor = (row) => ({
    id: row.id,
    uid: row.uid,
    name: row.name,
    email: row.email,
    mobile: row.mobile,
    nid: row.nid,
    shares: row.shares,
    amount: row.amount,
    investments: [],
    awardedFreeShares: row.awarded_free_shares,
    referredBy: row.referred_by,
    status: row.status,
    createdAt: row.created_at
  });

  // Real-time investor data subscription
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('investor-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investors',
        filter: `uid=eq.${currentUser.id}`
      }, async (payload) => {
        if (payload.new) {
          const investor = mapInvestor(payload.new);
          const { data: investments } = await supabase
            .from('investments')
            .select('*')
            .eq('investor_id', investor.id)
            .order('created_at', { ascending: true });
          investor.investments = (investments || []).map(inv => ({
            shares: inv.shares, amount: inv.amount,
            joiningDate: inv.joining_date, activationDate: inv.activation_date,
            status: inv.status, paymentMethod: inv.payment_method, trxId: inv.trx_id
          }));
          setUserData(investor);
        }
      })
      .subscribe();

    // Also load investments initially
    if (userData?.id) {
      supabase.from('investments').select('*')
        .eq('investor_id', userData.id)
        .order('created_at', { ascending: true })
        .then(({ data: investments }) => {
          if (investments && userData) {
            setUserData(prev => prev ? {
              ...prev,
              investments: investments.map(inv => ({
                shares: inv.shares, amount: inv.amount,
                joiningDate: inv.joining_date, activationDate: inv.activation_date,
                status: inv.status, paymentMethod: inv.payment_method, trxId: inv.trx_id
              }))
            } : prev);
          }
        });
    }

    return () => supabase.removeChannel(channel);
  }, [currentUser?.id]);

  // Fetch profit data (returnPayments) for logged-in investor
  useEffect(() => {
    if (!userData?.id) {
      setProfitData(null);
      setReturnPayments([]);
      return;
    }

    const fetchPayments = async () => {
      const { data: payments } = await supabase
        .from('return_payments')
        .select('*')
        .eq('investor_id', userData.id)
        .order('year', { ascending: false });

      const mapped = (payments || []).map(p => ({
        docId: p.id, investorId: p.investor_id, investorName: p.investor_name,
        year: p.year, month: p.month, profitPerShare: p.profit_per_share,
        activeShares: p.active_shares, amount: p.total_amount,
        status: p.payment_status, paymentMethod: p.payment_method,
        trxId: p.trx_id, lastUpdated: p.last_updated
      }));
      setReturnPayments(mapped);

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const totalProfit = mapped.reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingProfit = mapped.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.amount || 0), 0);
      const thisMonthPayment = mapped.find(p => p.month === currentMonth && p.year === currentYear);
      setProfitData({
        totalProfit,
        pendingProfit,
        thisMonthProfit: thisMonthPayment ? thisMonthPayment.amount : 0,
      });
    };

    fetchPayments();

    const channel = supabase
      .channel('return-payments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'return_payments',
        filter: `investor_id=eq.${userData.id}`
      }, () => fetchPayments())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userData?.id]);

  // Real-time listener for share requests
  useEffect(() => {
    if (!userData?.id) {
      setShareRequests([]);
      return;
    }

    const fetchRequests = async () => {
      const { data: requests } = await supabase
        .from('share_requests')
        .select('*')
        .eq('investor_id', userData.id)
        .order('date_requested', { ascending: false });

      setShareRequests((requests || []).map(r => ({
        docId: r.id, id: r.id, investorId: r.investor_id, investorName: r.investor_name,
        sharesCount: r.shares_count, amount: r.amount,
        paymentMethod: r.payment_method, trxId: r.trx_id,
        status: r.status, rejectReason: r.reject_reason,
        dateRequested: r.date_requested
      })));
    };

    fetchRequests();

    const channel = supabase
      .channel('share-requests-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'share_requests',
        filter: `investor_id=eq.${userData.id}`
      }, () => fetchRequests())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userData?.id]);

  // Sign Up / Register
  async function register(name, email, mobile, password, nid, referredBy) {
    try {
      // 1. Check if investor record already exists for this email
      const { data: existingInvestor } = await supabase
        .from('investors')
        .select('id, uid')
        .eq('email', email)
        .maybeSingle();

      if (existingInvestor && existingInvestor.uid) {
        throw new Error("This email is already registered. Please login instead.");
      }

      // 2. Perform Auth Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      let user = authData?.user;

      if (authError) {
        if (authError.message?.includes('already registered') || authError.status === 422) {
          // Auth account exists but investor record is missing or has no uid — sign in to get the user
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) {
            throw new Error("This email is already registered. Please login instead.");
          }
          user = signInData?.user;
        } else {
          throw new Error(authError.message || "Failed to create user account.");
        }
      }

      if (!user) {
        throw new Error("Failed to retrieve user account. Please try again.");
      }

      // 3. If investor record exists without uid, link it to this auth user
      if (existingInvestor && !existingInvestor.uid) {
        const { error: linkError } = await supabase
          .from('investors')
          .update({ uid: user.id, name, mobile, nid })
          .eq('id', existingInvestor.id);
        if (linkError) throw new Error(linkError.message);
        return;
      }

      // 4. Create new investor record with sequential ID
      let success = false;
      let retries = 5;
      let lastError = null;

      while (!success && retries > 0) {
        const { data: counterData, error: counterError } = await supabase
          .from('metadata')
          .select('value')
          .eq('key', 'counters')
          .single();

        if (counterError) {
          throw new Error("Failed to read server configuration. Please try again.");
        }

        const lastId = counterData?.value?.lastInvestorId || 1000;
        const nextId = lastId + 1;

        const { error: updateError } = await supabase
          .from('metadata')
          .update({ value: { ...counterData.value, lastInvestorId: nextId } })
          .eq('key', 'counters');

        if (updateError) {
          retries--;
          lastError = updateError;
          continue;
        }

        const { error: investorError } = await supabase.from('investors').insert({
          id: String(nextId),
          uid: user.id,
          name,
          email,
          mobile,
          nid,
          shares: 0,
          amount: 0,
          awarded_free_shares: 0,
          referred_by: referredBy || null
        });

        if (investorError) {
          lastError = investorError;
          if (investorError.code === '23505') {
            if (investorError.message?.includes('uid') || investorError.message?.includes('email')) {
              success = true;
              break;
            }
            retries--;
            continue;
          }
          throw investorError;
        }

        success = true;
      }

      if (!success) {
        throw new Error(lastError?.message || "Failed to create investor profile. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      throw new Error(err.message || "An unexpected error occurred during registration.");
    }
  }

  // Login
  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  // Logout
  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setCurrentUser(null);
    setUserData(null);
  }

  // Create share request
  async function requestShares(sharesCount, paymentMethod, trxId) {
    if (!currentUser || !userData) throw new Error("Must be logged in.");

    const amount = sharesCount * 500;

    const { data: newRequest, error } = await supabase.from('share_requests').insert({
      investor_id: userData.id,
      investor_name: userData.name,
      shares_count: sharesCount,
      amount,
      payment_method: paymentMethod,
      trx_id: trxId,
      status: 'Pending'
    }).select().single();
    if (error) throw error;

    return newRequest;
  }

  const value = {
    currentUser,
    userData,
    loading,
    isDemoMode: false,
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
