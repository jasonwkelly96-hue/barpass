"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import QUESTIONS from "./questions.json";

function getSubtopics(subject) {
  return Array.from(new Set(QUESTIONS.filter(q => q.subject === subject).map(q => q.subtopic)));
}

function calculateSubtopicStats(responses) {
  const stats = {};
  responses.forEach(r => {
    const q = QUESTIONS.find(q2 => q2.id === r.questionId);
    if (!q) return;
    const key = q.subject + "|" + q.subtopic;
    if (!stats[key]) stats[key] = { subject: q.subject, subtopic: q.subtopic, correct: 0, total: 0, totalTime: 0 };
    stats[key].total++;
    stats[key].totalTime += r.timeSpent;
    if (r.correct) stats[key].correct++;
  });
  return stats;
}

function selectNextQuestion(responses, answeredIds) {
  const available = QUESTIONS.filter(q => !answeredIds.has(q.id));
  if (available.length === 0) return null;
  if (responses.length < 3) {
    const easy = available.filter(q => q.difficulty <= 2);
    const pool = easy.length > 0 ? easy : available;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const stats = calculateSubtopicStats(responses);
  const scored = available.map(q => {
    const key = q.subject + "|" + q.subtopic;
    const s = stats[key];
    let priority = 50;
    if (s && s.total > 0) { priority = (1 - s.correct / s.total) * 100; }
    priority += Math.random() * 15;
    return { question: q, priority };
  });
  scored.sort((a, b) => b.priority - a.priority);
  return scored[0].question;
}

const FONT_LINK = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap";

export default function BarPassApp() {
  const [screen, setScreen] = useState("home");
  const [responses, setResponses] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [answeredIds, setAnsweredIds] = useState(new Set());
  const [sessionCount, setSessionCount] = useState(0);
  const [studySubject, setStudySubject] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_LINK;
    document.head.appendChild(link);
  }, []);

  const startStudy = useCallback((subject) => {
    setStudySubject(subject || null);
    setSessionCount(0);
    const pool = subject ? QUESTIONS.filter(q => q.subject === subject) : QUESTIONS;
    const poolIds = new Set(pool.map(q => q.id));
    const filteredResponses = responses.filter(r => poolIds.has(r.questionId));
    const filteredIds = new Set(Array.from(answeredIds).filter(id => poolIds.has(id)));
    let next = selectNextQuestion(filteredResponses, filteredIds);
    if (!next) {
      const newIds = new Set(Array.from(answeredIds).filter(id => !poolIds.has(id)));
      setAnsweredIds(newIds);
      next = selectNextQuestion(filteredResponses, new Set());
    }
    setCurrentQuestion(next);
    setSelectedAnswers([]);
    setShowResult(false);
    setQuestionStartTime(Date.now());
    setScreen("study");
  }, [responses, answeredIds]);

  const toggleAnswer = useCallback((choiceIndex) => {
    if (showResult) return;
    if (!currentQuestion) return;
    const needed = currentQuestion.selectCount || 1;
    if (needed === 1) {
      setSelectedAnswers([choiceIndex]);
      // auto submit for single select
      const timeSpent = (Date.now() - questionStartTime) / 1000;
      const isCorrect = currentQuestion.correct.length === 1 && currentQuestion.correct[0] === choiceIndex;
      setShowResult(true);
      setResponses(prev => [...prev, { questionId: currentQuestion.id, selected: [choiceIndex], correct: isCorrect, timeSpent, timestamp: Date.now() }]);
      setAnsweredIds(prev => new Set([...Array.from(prev), currentQuestion.id]));
      setSessionCount(prev => prev + 1);
    } else {
      setSelectedAnswers(prev => {
        if (prev.includes(choiceIndex)) return prev.filter(i => i !== choiceIndex);
        if (prev.length >= needed) return prev;
        return [...prev, choiceIndex];
      });
    }
  }, [showResult, questionStartTime, currentQuestion]);

  const submitMulti = useCallback(() => {
    if (showResult || !currentQuestion) return;
    const needed = currentQuestion.selectCount || 1;
    if (selectedAnswers.length !== needed) return;
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    const sortedSelected = [...selectedAnswers].sort();
    const sortedCorrect = [...currentQuestion.correct].sort();
    const isCorrect = sortedSelected.length === sortedCorrect.length && sortedSelected.every((v, i) => v === sortedCorrect[i]);
    setShowResult(true);
    setResponses(prev => [...prev, { questionId: currentQuestion.id, selected: selectedAnswers, correct: isCorrect, timeSpent, timestamp: Date.now() }]);
    setAnsweredIds(prev => new Set([...Array.from(prev), currentQuestion.id]));
    setSessionCount(prev => prev + 1);
  }, [showResult, selectedAnswers, questionStartTime, currentQuestion]);

  const nextQuestion = useCallback(() => {
    const pool = studySubject ? QUESTIONS.filter(q => q.subject === studySubject) : QUESTIONS;
    const poolIds = new Set(pool.map(q => q.id));
    const filteredAnswered = new Set(Array.from(answeredIds).filter(id => poolIds.has(id)));
    let next = selectNextQuestion(
      studySubject ? responses.filter(r => poolIds.has(r.questionId)) : responses,
      filteredAnswered
    );
    if (!next) {
      const newIds = new Set(Array.from(answeredIds).filter(id => !poolIds.has(id)));
      setAnsweredIds(newIds);
      next = selectNextQuestion(
        studySubject ? responses.filter(r => poolIds.has(r.questionId)) : responses,
        new Set()
      );
    }
    setCurrentQuestion(next);
    setSelectedAnswers([]);
    setShowResult(false);
    setQuestionStartTime(Date.now());
  }, [answeredIds, responses, studySubject]);

  const stats = useMemo(() => {
    if (responses.length === 0) return null;
    const total = responses.length;
    const correct = responses.filter(r => r.correct).length;
    const accuracy = Math.round((correct / total) * 100);
    const avgTime = (responses.reduce((s, r) => s + r.timeSpent, 0) / total).toFixed(1);
    const bySubject = {};
    responses.forEach(r => {
      const q = QUESTIONS.find(q2 => q2.id === r.questionId);
      if (!q) return;
      if (!bySubject[q.subject]) bySubject[q.subject] = { correct: 0, total: 0, totalTime: 0 };
      bySubject[q.subject].total++;
      bySubject[q.subject].totalTime += r.timeSpent;
      if (r.correct) bySubject[q.subject].correct++;
    });
    return { total, correct, accuracy, avgTime, bySubject, subtopicStats: calculateSubtopicStats(responses) };
  }, [responses]);

  const colors = { bg: "#0F1117", surface: "#1A1D27", surfaceHover: "#232736", border: "#2A2E3B", accent: "#6C5CE7", accentLight: "#8B7CF6", correct: "#00B894", correctBg: "rgba(0,184,148,0.08)", incorrect: "#E17055", incorrectBg: "rgba(225,112,85,0.08)", text: "#E8E6F0", textMuted: "#8B8A97", textDim: "#5A5868", gold: "#FDCB6E" };
  const baseStyles = {
    app: { fontFamily: "'DM Sans', sans-serif", background: colors.bg, color: colors.text, minHeight: "100vh", width: "100%" },
    container: { maxWidth: 800, margin: "0 auto", padding: "0 24px" },
    h1: { fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, margin: 0 },
    card: { background: colors.surface, borderRadius: 12, border: "1px solid " + colors.border, padding: 24 },
    btn: { background: colors.accent, color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
    btnOutline: { background: "transparent", color: colors.text, border: "1px solid " + colors.border, borderRadius: 8, padding: "12px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
    tag: { display: "inline-block", background: "rgba(108,92,231,0.15)", color: colors.accentLight, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }
  };

  if (screen === "home") {
    const subjects = Array.from(new Set(QUESTIONS.map(q => q.subject)));
    return (
      <div style={baseStyles.app}>
        <div style={baseStyles.container}>
          <div style={{ padding: "40px 0 32px", borderBottom: "1px solid " + colors.border }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, " + colors.accent + ", " + colors.accentLight + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" }}>B</div>
              <span style={{ ...baseStyles.h1, fontSize: 24 }}>BarPass</span>
              <span style={{ ...baseStyles.tag, marginLeft: 8 }}>NextGen UBE</span>
            </div>
            <p style={{ color: colors.textMuted, margin: "12px 0 0", fontSize: 15, lineHeight: 1.6 }}>Adaptive MBE question engine with performance tracking. Built for the NextGen Uniform Bar Exam.</p>
          </div>
          <div style={{ padding: "32px 0" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              <button style={baseStyles.btn} onClick={() => startStudy(null)}>Practice All Subjects</button>
              {stats && <button style={baseStyles.btnOutline} onClick={() => setScreen("dashboard")}>View Dashboard</button>}
            </div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Study by Subject</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {subjects.map(subject => {
                const qCount = QUESTIONS.filter(q => q.subject === subject).length;
                const subjectStats = stats?.bySubject[subject];
                const accuracy = subjectStats ? Math.round((subjectStats.correct / subjectStats.total) * 100) : null;
                const subtopics = getSubtopics(subject);
                return (
                  <div key={subject} style={{ ...baseStyles.card, cursor: "pointer" }} onClick={() => startStudy(subject)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>{subject}</h3>
                      {accuracy !== null && <span style={{ fontSize: 20, fontWeight: 700, color: accuracy >= 70 ? colors.correct : accuracy >= 50 ? colors.gold : colors.incorrect }}>{accuracy}%</span>}
                    </div>
                    <p style={{ margin: "0 0 12px", fontSize: 13, color: colors.textMuted }}>{qCount} questions · {subtopics.length} subtopics</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {subtopics.map(st => <span key={st} style={{ fontSize: 11, color: colors.textDim, background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 4 }}>{st}</span>)}
                    </div>
                  </div>
                );
              })}
            </div>
            {stats && (
              <div style={{ ...baseStyles.card, marginTop: 24, display: "flex", gap: 32, flexWrap: "wrap" }}>
                <div><div style={{ fontSize: 12, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Questions Answered</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.total}</div></div>
                <div><div style={{ fontSize: 12, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Overall Accuracy</div><div style={{ fontSize: 28, fontWeight: 700, color: stats.accuracy >= 70 ? colors.correct : stats.accuracy >= 50 ? colors.gold : colors.incorrect }}>{stats.accuracy}%</div></div>
                <div><div style={{ fontSize: 12, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Avg. Time/Question</div><div style={{ fontSize: 28, fontWeight: 700 }}>{stats.avgTime}s</div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "study" && currentQuestion) {
    const q = currentQuestion;
    const choiceLabels = ["A", "B", "C", "D", "E", "F"];
    const isMulti = (q.selectCount || 1) > 1;
    const needed = q.selectCount || 1;
    return (
      <div style={baseStyles.app}>
        <div style={baseStyles.container}>
          <div style={{ padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + colors.border }}>
            <button style={{ ...baseStyles.btnOutline, padding: "8px 16px", fontSize: 13 }} onClick={() => setScreen("home")}>← Back</button>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={baseStyles.tag}>{q.subject}</span>
              <span style={{ fontSize: 13, color: colors.textMuted }}>Q{sessionCount + 1}</span>
              <span style={{ fontSize: 13, color: colors.textMuted }}>{"●".repeat(q.difficulty) + "○".repeat(3 - q.difficulty)}</span>
            </div>
          </div>
          <div style={{ padding: "32px 0" }}>
            <div style={{ fontSize: 11, color: colors.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>{q.subtopic}</div>
            <div style={{ ...baseStyles.card, marginBottom: 24 }}>
              <p style={{ fontSize: 15, lineHeight: 1.75, margin: "0 0 16px", whiteSpace: "pre-wrap" }}>{q.stem}</p>
              <p style={{ fontSize: 15, lineHeight: 1.75, margin: 0, fontWeight: 600 }}>{q.question}</p>
            </div>
            {isMulti && !showResult && (
              <div style={{ marginBottom: 12, padding: "8px 14px", background: "rgba(108,92,231,0.1)", borderRadius: 8, fontSize: 13, color: colors.accentLight }}>
                Select {needed} answers {selectedAnswers.length > 0 && "(" + selectedAnswers.length + "/" + needed + " selected)"}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.choices.map((choice, i) => {
                let bg = colors.surface, borderColor = colors.border, labelBg = "rgba(255,255,255,0.06)", labelColor = colors.textMuted;
                const isSelected = selectedAnswers.includes(i);
                const isCorrectChoice = q.correct.includes(i);
                if (showResult) {
                  if (isCorrectChoice) { bg = colors.correctBg; borderColor = colors.correct; labelBg = colors.correct; labelColor = "#fff"; }
                  else if (isSelected && !isCorrectChoice) { bg = colors.incorrectBg; borderColor = colors.incorrect; labelBg = colors.incorrect; labelColor = "#fff"; }
                } else if (isSelected) {
                  borderColor = colors.accent; labelBg = colors.accent; labelColor = "#fff";
                }
                return (
                  <div key={i} onClick={() => toggleAnswer(i)} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: bg, border: "1px solid " + borderColor, borderRadius: 10, padding: "14px 16px", cursor: showResult ? "default" : "pointer" }}>
                    <span style={{ minWidth: 28, height: 28, borderRadius: isMulti ? 4 : 6, background: labelBg, color: labelColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{choiceLabels[i]}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.65 }}>{choice}</span>
                  </div>
                );
              })}
            </div>
            {isMulti && !showResult && selectedAnswers.length === needed && (
              <button style={{ ...baseStyles.btn, marginTop: 16, width: "100%" }} onClick={submitMulti}>Submit Answer</button>
            )}
            {showResult && (
              <div style={{ marginTop: 24 }}>
                <div style={{ ...baseStyles.card, borderColor: responses[responses.length - 1]?.correct ? colors.correct : colors.incorrect, borderLeftWidth: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: responses[responses.length - 1]?.correct ? colors.correct : colors.incorrect, fontSize: 14, fontWeight: 700 }}>
                    {responses[responses.length - 1]?.correct ? "✓ Correct" : "✗ Incorrect"}
                  </div>
                  {selectedAnswers.map(si => (
                    <div key={si} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: q.correct.includes(si) ? colors.correct : colors.incorrect, marginBottom: 4 }}>Your answer — {choiceLabels[si]}:</div>
                      <p style={{ fontSize: 14, lineHeight: 1.75, margin: 0, color: colors.textMuted }}>{q.explanations[si]}</p>
                    </div>
                  ))}
                  {q.correct.filter(ci => !selectedAnswers.includes(ci)).map(ci => (
                    <div key={ci} style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + colors.border }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: colors.correct, marginBottom: 4 }}>Correct answer — {choiceLabels[ci]}:</div>
                      <p style={{ fontSize: 14, lineHeight: 1.75, color: colors.textMuted, margin: 0 }}>{q.explanations[ci]}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <button style={baseStyles.btn} onClick={nextQuestion}>Next Question →</button>
                  <button style={baseStyles.btnOutline} onClick={() => setScreen("dashboard")}>View Dashboard</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "dashboard") {
    if (!stats) {
      return (
        <div style={baseStyles.app}><div style={baseStyles.container}><div style={{ padding: "60px 0", textAlign: "center" }}>
          <h2 style={{ ...baseStyles.h1, marginBottom: 16 }}>No Data Yet</h2>
          <p style={{ color: colors.textMuted, marginBottom: 24 }}>Answer some questions to see your performance analytics.</p>
          <button style={baseStyles.btn} onClick={() => startStudy(null)}>Start Practicing</button>
        </div></div></div>
      );
    }
    const subjects = Object.keys(stats.bySubject);
    return (
      <div style={baseStyles.app}>
        <div style={baseStyles.container}>
          <div style={{ padding: "32px 0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + colors.border }}>
            <div>
              <h1 style={{ ...baseStyles.h1, marginBottom: 4 }}>Performance Dashboard</h1>
              <p style={{ color: colors.textMuted, margin: 0, fontSize: 14 }}>{stats.total} questions answered</p>
            </div>
            <button style={{ ...baseStyles.btnOutline, padding: "8px 16px", fontSize: 13 }} onClick={() => setScreen("home")}>← Back</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, padding: "24px 0" }}>
            {[
              { label: "Overall Accuracy", value: stats.accuracy + "%", color: stats.accuracy >= 70 ? colors.correct : stats.accuracy >= 50 ? colors.gold : colors.incorrect },
              { label: "Correct", value: stats.correct, color: colors.correct },
              { label: "Incorrect", value: stats.total - stats.correct, color: colors.incorrect },
              { label: "Avg Time", value: stats.avgTime + "s", color: parseFloat(stats.avgTime) <= 90 ? colors.correct : colors.gold }
            ].map(item => (
              <div key={item.label} style={baseStyles.card}>
                <div style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "8px 0 24px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>By Subject</h3>
            {subjects.map(subject => {
              const s = stats.bySubject[subject];
              const acc = Math.round((s.correct / s.total) * 100);
              const avgT = (s.totalTime / s.total).toFixed(1);
              const accColor = acc >= 70 ? colors.correct : acc >= 50 ? colors.gold : colors.incorrect;
              return (
                <div key={subject} style={{ ...baseStyles.card, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 16, fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>{subject}</h4>
                    <span style={{ fontSize: 24, fontWeight: 700, color: accColor }}>{acc}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: acc + "%", background: accColor, borderRadius: 3 }} />
                  </div>
                  <div style={{ display: "flex", gap: 24, fontSize: 13, color: colors.textMuted }}>
                    <span>{s.correct}/{s.total} correct</span>
                    <span>{avgT}s avg</span>
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + colors.border }}>
                    {Object.entries(stats.subtopicStats).filter(([key]) => key.startsWith(subject)).map(([key, st]) => {
                      const stAcc = Math.round((st.correct / st.total) * 100);
                      const stColor = stAcc >= 70 ? colors.correct : stAcc >= 50 ? colors.gold : colors.incorrect;
                      return (
                        <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                          <span style={{ fontSize: 13, color: colors.textMuted }}>{st.subtopic}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 12, color: colors.textDim }}>{st.correct}/{st.total}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: stColor, minWidth: 40, textAlign: "right" }}>{stAcc}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ paddingBottom: 40 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Timing Analysis</h3>
            <div style={baseStyles.card}>
              <p style={{ fontSize: 14, color: colors.textMuted, margin: "0 0 16px", lineHeight: 1.6 }}>Target: ~1.8 minutes per question (108 seconds). Your average: <strong style={{ color: colors.text }}>{stats.avgTime}s</strong></p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {responses.slice(-10).map((r, i) => {
                  const rq = QUESTIONS.find(q2 => q2.id === r.questionId);
                  const barWidth = Math.min((r.timeSpent / 180) * 100, 100);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 11, color: colors.textDim, minWidth: 80, textAlign: "right" }}>{rq?.subtopic?.slice(0, 20)}</span>
                      <div style={{ flex: 1, height: 16, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: barWidth + "%", background: r.correct ? "linear-gradient(90deg, rgba(0,184,148,0.27), #00B894)" : "linear-gradient(90deg, rgba(225,112,85,0.27), #E17055)", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, color: colors.textMuted, minWidth: 36, textAlign: "right" }}>{r.timeSpent.toFixed(0)}s</span>
                      <span style={{ fontSize: 14 }}>{r.correct ? "✓" : "✗"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ paddingBottom: 40, textAlign: "center" }}>
            <button style={baseStyles.btn} onClick={() => startStudy(null)}>Continue Practicing</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
