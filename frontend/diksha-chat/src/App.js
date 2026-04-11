import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = 'http://127.0.0.1:8000';

const LANGUAGES = [
  { code: 'en', label: 'English',  native: 'English',  flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi',    native: 'हिंदी',    flag: '🇮🇳' },
  { code: 'ga', label: 'Garhwali', native: 'गढ़वाली',  flag: '🏔️' },
  { code: 'ku', label: 'Kumauni',  native: 'कुमाऊनी', flag: '🌄' },
];

const COLLEGE_INFO = [
  { label: 'Established', value: '1989' },
  { label: 'Approved By', value: 'UGC & AICTE' },
  { label: 'Courses',     value: 'B.Tech, M.Tech, MCA, PhD' },
  { label: 'Top Package', value: '₹92 LPA' },
  { label: 'Top Recruiter', value: 'Amazon, Microsoft, HCL' },
  { label: 'Campus Area', value: 'Pauri Garhwal' },
];

const QUICK_BUTTONS = [
  { label: '🎓 Admissions', query: 'What is the admission process?' },
  { label: '💰 Fees',       query: 'What are the fees?' },
  { label: '🏠 Hostel',     query: 'Does GBPIET have hostel facility?' },
  { label: '📚 Courses',    query: 'What courses are available?' },
  { label: '💼 Placements', query: 'What is the placement record?' },
  { label: '📞 Contact',    query: 'What is the contact number?' },
];

const GREET_EN = "Namaste! 🙏 I'm Diksha, your AI guide to Govind Ballabh Pant Institute of Engineering and Technology, Pauri Garhwal. Ask me anything about admissions, courses, fees, hostel, placements, or campus life!";
const GREET_HI = "नमस्ते! 🙏 मैं दीक्षा हूँ, GBPIET की आपकी AI सहायक। कृपया नीचे अपनी भाषा चुनें।";

const WELCOMES = {
  en: "Great! I'll assist you in English. What would you like to know about GBPIET?",
  hi: "बहुत अच्छा! मैं आपकी हिंदी में सहायता करूँगी। GBPIET के बारे में आप क्या जानना चाहते हैं?",
  ga: "बढ़िया! मि तुमारी गढ़वाली मा मदद करूँलू। GBPIET बारे मा का जाणना छ?",
  ku: "ठीक छ! मैं तुमारी कुमाऊनी में मदद करूँलु। GBPIET बारे में क्या जाणना छ?"
};

function CourseDropdown({ lang }) {
  const [openUG, setOpenUG] = useState(false);
  const [openPG, setOpenPG] = useState(false);

  const ugCourses = [
    { name: 'B.Tech CSE',    seats: '120', fees: '~₹1,05,000/yr', years: '4 yr' },
    { name: 'B.Tech ECE',    seats: '60',  fees: '~₹1,05,000/yr', years: '4 yr' },
    { name: 'B.Tech EE',     seats: '60',  fees: '~₹1,05,000/yr', years: '4 yr' },
    { name: 'B.Tech ME',     seats: '60',  fees: '~₹1,05,000/yr', years: '4 yr' },
    { name: 'B.Tech Civil',  seats: '60',  fees: '~₹1,05,000/yr', years: '4 yr' },
    { name: 'B.Tech Biotech',seats: '30',  fees: '~₹1,05,000/yr', years: '4 yr' },
  ];

  const pgCourses = [
    { name: 'MCA',        seats: '60', fees: '~₹70,000/yr', years: '2 yr' },
    { name: 'M.Tech CSE', seats: '18', fees: '~₹60,000/yr', years: '2 yr' },
    { name: 'M.Tech ECE', seats: '18', fees: '~₹60,000/yr', years: '2 yr' },
  ];

  return (
    <div className="course-dropdown">
      <p className="dropdown-title">
        {lang === 'hi' ? '📚 GBPIET के कोर्स:' : '📚 GBPIET Courses:'}
      </p>
      <button className="dropdown-header" onClick={() => setOpenUG(!openUG)}>
        <span>🎓 {lang === 'hi' ? 'स्नातक (B.Tech)' : 'Undergraduate (B.Tech)'}</span>
        <span>{openUG ? '▲' : '▼'}</span>
      </button>
      {openUG && (
        <div className="dropdown-content">
          {ugCourses.map((c, i) => (
            <div key={i} className="course-card">
              <div className="course-name">{c.name}</div>
              <div className="course-info">
                <span>🪑 {c.seats}</span>
                <span>⏱ {c.years}</span>
                <span>💰 {c.fees}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <button className="dropdown-header" onClick={() => setOpenPG(!openPG)}>
        <span>🎓 {lang === 'hi' ? 'स्नातकोत्तर' : 'Postgraduate (M.Tech/MCA)'}</span>
        <span>{openPG ? '▲' : '▼'}</span>
      </button>
      {openPG && (
        <div className="dropdown-content">
          {pgCourses.map((c, i) => (
            <div key={i} className="course-card">
              <div className="course-name">{c.name}</div>
              <div className="course-info">
                <span>🪑 {c.seats}</span>
                <span>⏱ {c.years}</span>
                <span>💰 {c.fees}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div
        className="more-link"
        onClick={() => window.open('https://gbpiet.ac.in/academic-programmes/', '_blank')}
      >
        🌐 {lang === 'hi' ? 'पूरी जानकारी देखें →' : 'View full details →'}
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages]             = useState([]);
  const [input, setInput]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [sessionId, setSessionId]           = useState(null);
  const [language, setLanguage]             = useState(null);
  const [isSpeaking, setIsSpeaking]         = useState(false);
  const [isListening, setIsListening]       = useState(false);
  const [showLangSelect, setShowLangSelect] = useState(true);
  const [currentLang, setCurrentLang]       = useState('en');
  const messagesEndRef = useRef(null);
  const synthRef       = useRef(window.speechSynthesis);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load voices
    synthRef.current.getVoices();
    greetUser();
  }, []);

  const speak = (text, langCode, onEnd) => {
    const synth = synthRef.current;
    synth.cancel();
    if (!text) return;
    const u      = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    let voice    = null;
    if (langCode === 'en') {
      voice = voices.find(v => v.lang === 'en-IN')
           || voices.find(v => v.lang.startsWith('en'));
    } else {
      voice = voices.find(v => v.lang === 'hi-IN')
           || voices.find(v => v.lang.startsWith('hi'));
    }
    if (voice) u.voice = voice;
    u.lang   = langCode === 'en' ? 'en-IN' : 'hi-IN';
    u.rate   = langCode === 'en' ? 0.88 : 0.82;
    u.pitch  = 1.1;
    u.volume = 1.0;
    u.onstart = () => setIsSpeaking(true);
    u.onend   = () => { setIsSpeaking(false); if (onEnd) onEnd(); };
    u.onerror = () => { setIsSpeaking(false); if (onEnd) onEnd(); };
    setTimeout(() => synth.speak(u), 150);
  };

  const greetUser = () => {
    const t = new Date().toLocaleTimeString();
    setMessages([
      { role: 'diksha', text: GREET_EN, lang: 'en', time: t },
      { role: 'diksha', text: GREET_HI, lang: 'hi', time: t },
    ]);
    setShowLangSelect(true);
    speak(GREET_EN, 'en', () => {
      setTimeout(() => speak(GREET_HI, 'hi'), 200);
    });
  };

  const selectLanguage = (langCode) => {
    setLanguage(langCode);
    setCurrentLang(langCode);
    setShowLangSelect(false);
    const msg = {
      role: 'diksha',
      text: WELCOMES[langCode],
      lang: langCode,
      time: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, msg]);
    speak(WELCOMES[langCode], langCode);
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome for voice input!'); return; }
    const r    = new SR();
    r.lang     = language === 'en' ? 'en-IN' : 'hi-IN';
    r.onstart  = () => setIsListening(true);
    r.onend    = () => setIsListening(false);
    r.onresult = e => setInput(e.results[0][0].transcript);
    r.onerror  = () => setIsListening(false);
    r.start();
  };

  const isCourseQuery = q =>
    ['course','courses','branch','btech','b.tech','mca','mtech',
     'm.tech','program','programme','कोर्स','शाखा','कार्यक्रम']
    .some(k => q.toLowerCase().includes(k));

  const handleSend = async (questionText) => {
    const q = (questionText || input).trim();
    if (!q || !language) return;
    setMessages(prev => [...prev, {
      role: 'user', text: q,
      time: new Date().toLocaleTimeString()
    }]);
    setInput('');
    setLoading(true);

    if (isCourseQuery(q)) {
      setMessages(prev => [...prev, {
        role: 'diksha',
        text: language === 'hi'
          ? 'यहाँ GBPIET के सभी कोर्स की जानकारी है:'
          : 'Here are all courses offered at GBPIET:',
        lang: language,
        type: 'courses',
        time: new Date().toLocaleTimeString()
      }]);
      setLoading(false);
      return;
    }

    try {
      const res  = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q, session_id: sessionId,
          is_first_message: false, language
        })
      });
      const data = await res.json();
      if (!sessionId) setSessionId(data.session_id);
      const botMsg = {
        role: 'diksha', text: data.answer,
        lang: language, time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'diksha',
        text: 'Server se connect nahi ho pa raha. Please try again!',
        lang: 'en', time: new Date().toLocaleTimeString()
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="app-container">

      {/* LEFT SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="college-logo">🎓</div>
          <div className="college-title">
            <h2>GBPIET</h2>
            <p>PAURI GARHWAL, UTTARAKHAND</p>
          </div>
        </div>

        <div className="sidebar-section-title">COLLEGE HIGHLIGHTS</div>

        {COLLEGE_INFO.map((info, i) => (
          <div key={i} className="info-card">
            <div className="info-label">{info.label}</div>
            <div className="info-value">{info.value}</div>
          </div>
        ))}

        <div className="sidebar-section-title" style={{marginTop:20}}>CONTACT</div>
        <div className="info-card">
          <div className="info-label">📞 Phone</div>
          <div className="info-value">01368-228030</div>
        </div>
        <div className="info-card">
          <div className="info-label">📧 Email</div>
          <div className="info-value">director@gbpiet.ac.in</div>
        </div>
        <div className="info-card">
          <div className="info-label">🌐 Website</div>
          <div
            className="info-value link"
            onClick={() => window.open('https://gbpiet.ac.in', '_blank')}
          >gbpiet.ac.in</div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="chat-main">

        {/* Top Bar */}
        <div className="chat-topbar">
          <div className="topbar-left">
            <div className={`diksha-avatar-top ${isSpeaking ? 'speaking' : ''}`}>
              {isSpeaking ? '🗣️' : 'D'}
            </div>
            <div className="topbar-info">
              <h3>Diksha — दीक्षा</h3>
              <p>
                {isSpeaking   ? '🔊 Speaking...'
                : isListening ? '🎤 Listening...'
                : '● Online — ready to help'}
              </p>
            </div>
          </div>
          <div className="topbar-right">
            {/* Language buttons */}
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                className={`lang-pill ${currentLang === l.code ? 'active' : ''}`}
                onClick={() => {
                  setCurrentLang(l.code);
                  if (language) setLanguage(l.code);
                }}
              >{l.flag} {l.label}</button>
            ))}
            {isSpeaking && (
              <button className="stop-pill" onClick={stopSpeaking}>🔇</button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              {msg.role === 'diksha' && (
                <div className={`msg-avatar ${isSpeaking ? 'pulse' : ''}`}>D</div>
              )}
              <div className="msg-content">
                <div className="msg-bubble">
                  {msg.text}
                  {msg.type === 'courses' && <CourseDropdown lang={msg.lang} />}
                </div>
                <div className="msg-meta">
                  <span className="msg-time">{msg.time}</span>
                  {msg.role === 'diksha' && (
                    <button
                      className="speak-btn"
                      onClick={() => speak(msg.text, msg.lang)}
                    >🔊</button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Language Selection */}
          {showLangSelect && (
            <div className="lang-select-box">
              <p className="lang-select-title">
                🌐 Select your language / अपनी भाषा चुनें
              </p>
              <div className="lang-select-grid">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    className="lang-select-btn"
                    onClick={() => selectLanguage(l.code)}
                  >
                    <span className="ls-flag">{l.flag}</span>
                    <span className="ls-native">{l.native}</span>
                    <span className="ls-en">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typing */}
          {loading && (
            <div className="message-row diksha">
              <div className="msg-avatar">D</div>
              <div className="msg-content">
                <div className="msg-bubble typing">
                  <span/><span/><span/>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        {/* Quick Buttons */}
        {language && (
          <div className="quick-buttons">
            {QUICK_BUTTONS.map((btn, i) => (
              <button
                key={i}
                className="quick-btn"
                onClick={() => handleSend(btn.query)}
              >{btn.label}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              language
                ? 'Ask about admissions, fees, courses...'
                : '🌐 Please select a language first...'
            }
            className="chat-textarea"
            rows={1}
            disabled={!language || loading}
          />
          <div className="input-actions">
            <button
              className={`voice-btn ${isListening ? 'listening' : ''}`}
              onClick={startListening}
              title="Voice input"
            >{isListening ? '🔴' : '🎤'}</button>
            <button
              className="send-btn"
              onClick={() => handleSend()}
              disabled={loading || !language || !input.trim()}
            >
              {loading ? '⏳' : 'Send ➤'}
            </button>
          </div>
          <p className="input-hint">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}