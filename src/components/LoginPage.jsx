import React, { useState } from 'react';
import { ShieldCheck, Wifi, Lock, Mail, ArrowRight, UserCheck, KeyRound, AlertCircle, Cpu, Server } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('noc.engineer@financial-wan.bank');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState('NOC_ENGINEER');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demoAccounts = [
    {
      label: 'NOC Lead Engineer',
      email: 'alex.chen@financial-wan.bank',
      role: 'NOC_ENGINEER',
      roleTitle: 'Senior WAN Network Operations Lead',
      avatar: 'AC'
    },
    {
      label: 'Branch Infrastructure Ops',
      email: 'sarah.jenkins@financial-wan.bank',
      role: 'BRANCH_MANAGER',
      roleTitle: 'Regional Branch Infrastructure Director',
      avatar: 'SJ'
    },
    {
      label: 'Security & Privacy Auditor',
      email: 'marcus.vance@financial-wan.bank',
      role: 'COMPLIANCE_AUDITOR',
      roleTitle: 'PCI-DSS Privacy Compliance Officer',
      avatar: 'MV'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter valid employee email and password credentials.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const selectedPreset = demoAccounts.find(a => a.email === email) || {
        email,
        roleTitle: role === 'NOC_ENGINEER' ? 'Network Operations Engineer' : 'Financial Infrastructure Specialist',
        avatar: email.substring(0, 2).toUpperCase()
      };

      onLoginSuccess({
        name: selectedPreset.label || email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: selectedPreset.email,
        role: role,
        roleTitle: selectedPreset.roleTitle,
        avatar: selectedPreset.avatar,
        lastLogin: new Date().toLocaleTimeString()
      });
    }, 600);
  };

  const handleQuickSelect = (acc) => {
    setEmail(acc.email);
    setRole(acc.role);
    setErrorMsg('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.15) 0%, rgba(9, 13, 22, 1) 70%)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '1050px',
        width: '100%',
        background: 'rgba(16, 24, 40, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Left Panel - Branding & Security System Graphics */}
        <div style={{
          padding: '3rem 2.5rem',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(15, 23, 42, 0.9))',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
              }}>
                <Wifi size={28} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                  COE Financial WAN Intelligence
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Branch Wireless Coverage & Interference Suite
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'white', lineHeight: '1.3', marginBottom: '1rem' }}>
              Secure Infrastructure Portal for 500+ Financial WAN Links
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '2rem' }}>
              Real-time Wi-Fi dead-zone mapping, crowdsourced signal telemetry, automated AP channel tuning, and fault-tolerant event stream recovery.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <ShieldCheck size={18} color="#34d399" /> Salted HMAC-SHA256 MAC Anonymization
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <Server size={18} color="#38bdf8" /> Real-time Watermarked Event Stream Engine
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <Cpu size={18} color="#a78bfa" /> Automated AP Channel & Tx Power Optimizer
              </div>
            </div>
          </div>

          <div style={{
            fontSize: '0.75rem',
            color: '#64748b',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            🔒 FIPS 140-3 & PCI-DSS Financial WAN Compliance Standard Active
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '0.3rem' }}>
              Employee SSO Sign In
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
              Enter your network credentials or select a quick demo persona.
            </p>
          </div>

          {errorMsg && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fecdd3',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ fontSize: '0.775rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                ENTERPRISE EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@financial-wan.bank"
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '0.7rem 0.75rem 0.7rem 2.4rem',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.775rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '0.7rem 0.75rem 0.7rem 2.4rem',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.775rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                ACCESS ROLE
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '0.7rem 0.75rem',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              >
                <option value="NOC_ENGINEER">Network Operations Lead (Full Control)</option>
                <option value="BRANCH_MANAGER">Branch Manager (View & Tuning)</option>
                <option value="COMPLIANCE_AUDITOR">Compliance Officer (Auditing & Reports)</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
            >
              {isSubmitting ? 'Authenticating Credentials...' : (
                <>Sign In to WAN Console <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.6rem' }}>
              QUICK DEMO PERSONA SWITCHER:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {demoAccounts.map((acc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickSelect(acc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: email === acc.email ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0,0,0,0.25)',
                    border: `1px solid ${email === acc.email ? '#3b82f6' : 'rgba(255,255,255,0.06)'}`,
                    padding: '0.45rem 0.75rem',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.775rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {acc.avatar}
                    </span>
                    <span>{acc.label}</span>
                  </div>
                  <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{acc.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
