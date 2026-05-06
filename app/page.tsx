"use client";
import { useState, useEffect, useCallback, useMemo } from "react";

const QUESTIONS = [
  {
    id: "c1", subject: "Contracts", subtopic: "Offer & Acceptance", difficulty: 1,
    stem: "A homeowner posted a notice on a community bulletin board stating: \"I will sell my lawnmower to the first person who pays me $200.\" A neighbor read the notice and immediately drove to the homeowner's house with $200 in cash. Before the neighbor arrived, the homeowner sold the lawnmower to a coworker who happened to stop by. When the neighbor arrived and tendered the $200, the homeowner refused to sell.",
    question: "Does the neighbor have a valid breach of contract claim against the homeowner?",
    choices: ["Yes, because the posting created a unilateral contract that the neighbor accepted by tendering payment.", "Yes, because the neighbor detrimentally relied on the homeowner's promise.", "No, because the posting was merely an invitation to negotiate, not an offer.", "No, because the neighbor had not yet tendered the $200 when the lawnmower was sold."],
    correct: 2,
    explanations: ["Incorrect. While a unilateral contract offer can be accepted by performance, the posting here is better characterized as an advertisement or invitation to deal.", "Incorrect. Promissory estoppel requires a clear and definite promise that the promisor should reasonably expect to induce reliance.", "Correct. Under general contract principles, advertisements and public postings are typically treated as invitations to negotiate rather than binding offers. The posting here directed at the general public without limiting the number of potential buyers functions as an invitation for offers, not an offer itself.", "Incorrect. While timing is relevant, the threshold issue is whether the posting constituted an offer at all."]
  },
  {
    id: "c2", subject: "Contracts", subtopic: "Consideration", difficulty: 2,
    stem: "A general contractor was building a house for a client under a fixed-price contract for $500,000. Midway through construction, the contractor discovered that the soil conditions were far worse than either party had anticipated, requiring an additional $80,000 in foundation work. The contractor told the client he would stop work unless the client agreed to pay the additional $80,000. The client, desperate to have the house completed on time, orally agreed to pay the extra amount. After the house was completed, the client refused to pay more than the original $500,000.",
    question: "Is the client's oral promise to pay the additional $80,000 enforceable?",
    choices: ["Yes, because the unforeseen soil conditions constitute a valid basis for contract modification.", "Yes, because the client received the benefit of the completed house.", "No, because the contractor had a preexisting duty to complete the house under the original contract.", "No, because the oral modification fails to satisfy the statute of frauds."],
    correct: 0,
    explanations: ["Correct. Under the modern approach reflected in the Restatement Second of Contracts, a modification is enforceable without additional consideration if it is fair and equitable in light of circumstances not anticipated when the contract was made.", "Incorrect. A benefit conferred under a preexisting contractual duty does not automatically create additional enforceable obligations.", "Incorrect under the modern approach. Modern courts recognize that modifications prompted by unanticipated circumstances are enforceable without new consideration.", "Incorrect. The modification here relates to construction services, not goods."]
  },
  {
    id: "c3", subject: "Contracts", subtopic: "Statute of Frauds", difficulty: 2,
    stem: "On June 1, a retailer and a manufacturer entered into an oral agreement under which the manufacturer would deliver 500 custom-designed widgets to the retailer by December 1 of the same year, at a total price of $15,000. The manufacturer began production immediately, spending $6,000 on specialized materials that could only be used for these particular widgets. On July 15, the retailer repudiated the agreement, claiming it was unenforceable.",
    question: "Is the oral agreement enforceable against the retailer?",
    choices: ["No, because the agreement is for goods priced at $500 or more and is not in writing.", "No, because the retailer repudiated before the manufacturer had completed performance.", "Yes, because the manufacturer's purchase of specialized materials takes the contract outside the statute of frauds.", "Yes, because the agreement was capable of being performed within one year."],
    correct: 2,
    explanations: ["Incorrect. While UCC 2-201 generally requires a writing for contracts for the sale of goods priced at $500 or more, the specially manufactured goods exception applies here.", "Incorrect. The enforceability does not depend on whether performance was completed before repudiation.", "Correct. Under UCC 2-201(3)(a), the statute of frauds does not apply to contracts for goods that are specially manufactured for the buyer, not suitable for sale to others, and where the seller has made a substantial beginning of manufacture.", "Incorrect. The UCC separate statute of frauds for goods priced at $500 or more still applies regardless of the one-year rule."]
  },
  {
    id: "c4", subject: "Contracts", subtopic: "Breach & Remedies", difficulty: 3,
    stem: "A famous artist agreed to paint a portrait of a corporate CEO for $50,000, to be completed within 60 days. After 30 days, the artist received an offer to paint a mural for a museum for $200,000. The artist notified the CEO that she would not complete the portrait. The CEO found another artist willing to paint the portrait for $65,000. The CEO also claimed $10,000 in consequential damages because the portrait was needed for an upcoming corporate event that had to be postponed.",
    question: "What is the most likely measure of the CEO's damages?",
    choices: ["$15,000, representing the difference between the contract price and the cost of the replacement artist.", "$25,000, representing the $15,000 cover cost plus the $10,000 in consequential damages.", "$15,000 in cover damages, because the consequential damages were not foreseeable at the time of contracting.", "$50,000, representing the full contract price as restitution."],
    correct: 2,
    explanations: ["Incomplete. This does not address the consequential damages claim.", "Incorrect. The consequential damages are likely not recoverable under Hadley v. Baxendale because the artist did not know the portrait was tied to a specific event.", "Correct. The CEO is entitled to cover damages of $15,000. However, the consequential damages for the postponed corporate event are likely not recoverable because nothing suggests the artist was aware the portrait was tied to a specific event deadline.", "Incorrect. The CEO has not yet paid the $50,000 so restitution does not apply."]
  },
  {
    id: "c5", subject: "Contracts", subtopic: "Third-Party Beneficiaries", difficulty: 2,
    stem: "A father entered into a written contract with a builder to construct a house on land owned by the father's daughter. The contract specified that the house was \"being built as a gift for my daughter, who will live in it upon completion.\" The builder used substandard materials, resulting in significant structural defects. The father paid the full contract price. The daughter sued the builder for damages.",
    question: "Can the daughter recover damages from the builder?",
    choices: ["No, because she was not in privity of contract with the builder.", "No, because she provided no consideration for the builder's promise.", "Yes, because she was an intended third-party beneficiary of the contract.", "Yes, but only if she can show she detrimentally relied on the contract."],
    correct: 2,
    explanations: ["Incorrect. Privity is not required for a third-party beneficiary to enforce a contract.", "Incorrect. A third-party beneficiary need not provide consideration.", "Correct. The contract explicitly identifies the daughter as the recipient of the house and states it is being built as a gift for her. She is clearly an intended donee beneficiary.", "Incorrect. Detrimental reliance is not a requirement for an intended third-party beneficiary."]
  },
  {
    id: "t1", subject: "Torts", subtopic: "Negligence — Duty of Care", difficulty: 1,
    stem: "A property owner hired a tree-trimming company to remove a large dead tree from his front yard. While the company's employee was cutting the tree, a large branch fell onto the sidewalk and struck a pedestrian who was walking past. The pedestrian suffered a broken arm. The employee had failed to set up any warning signs or barriers around the work area.",
    question: "If the pedestrian sues the property owner for negligence, is the property owner likely to be held liable?",
    choices: ["Yes, because a property owner is strictly liable for injuries caused by falling trees.", "Yes, because the property owner has a non-delegable duty to ensure that work on his property does not injure passersby.", "No, because the property owner delegated the work to an independent contractor.", "No, because the pedestrian assumed the risk by walking past an active work site."],
    correct: 1,
    explanations: ["Incorrect. There is no general strict liability rule for falling trees during removal.", "Correct. A property owner generally owes a non-delegable duty of care to those affected by dangerous activities on or adjacent to the property, particularly when the activity poses risks to people on public ways.", "Incorrect. The independent contractor doctrine does not apply when the duty is non-delegable.", "Incorrect. Assumption of risk requires voluntarily encountering a known and appreciated danger. No warning signs were posted."]
  },
  {
    id: "t2", subject: "Torts", subtopic: "Negligence — Causation", difficulty: 2,
    stem: "A driver ran a red light and collided with another car at an intersection. The other driver suffered a broken leg and was taken to the hospital by ambulance. On the way, the ambulance was hit by a drunk driver, and the injured person suffered additional injuries. The injured person sued the original driver for all injuries.",
    question: "Is the original driver liable for the injuries sustained in the ambulance accident?",
    choices: ["Yes, because the ambulance trip was a foreseeable consequence of the original accident.", "Yes, but only if the ambulance driver was also negligent.", "No, because the drunk driver's actions were a superseding cause.", "No, because the original driver's negligence was not the but-for cause of the ambulance accident."],
    correct: 0,
    explanations: ["Correct. Under proximate cause analysis, when a person is injured and requires medical transport, the risk of further injury during transport is a foreseeable consequence. Courts consistently hold that subsequent medical treatment and transport are within the scope of risk created by the original tortfeasor.", "Incorrect. Liability does not depend on the ambulance driver's negligence.", "Incorrect. A superseding cause must be truly extraordinary. Traffic accidents during ambulance transport are not considered extraordinary.", "Incorrect. But-for causation is satisfied because without the original collision, the plaintiff would not have been in the ambulance."]
  },
  {
    id: "t3", subject: "Torts", subtopic: "Strict Liability — Products", difficulty: 2,
    stem: "A consumer purchased a new blender. The first time she used it, the lid detached during operation, causing second-degree burns. Investigation revealed the locking mechanism allowed the lid to disengage under normal pressure. The manufacturer's engineers had considered an alternative design that would have prevented this at an additional cost of $0.50 per unit, but chose not to implement it.",
    question: "Under strict products liability, what is the strongest basis for the consumer's claim?",
    choices: ["Manufacturing defect, because the lid did not perform as intended.", "Design defect, because a reasonable alternative design existed that would have prevented the injury.", "Failure to warn, because the manufacturer did not warn about the risk of lid detachment.", "Breach of implied warranty of merchantability."],
    correct: 1,
    explanations: ["Incorrect. The blender performed exactly as designed; the problem is the design itself was deficient.", "Correct. Under the risk-utility test, the manufacturer's own engineers identified an alternative that would have prevented injury at a trivial cost of $0.50 per unit. The risk of serious burns far outweighs this minimal cost.", "Incorrect. When a feasible design fix exists, courts prefer design defect claims. A warning does not make an unreasonably dangerous design safe.", "Incorrect. This is a warranty claim under contract law, not strict products liability."]
  },
  {
    id: "t4", subject: "Torts", subtopic: "Intentional Torts — Battery", difficulty: 1,
    stem: "During a heated argument at a bar, one patron grabbed a glass of water and threw its contents in the face of another patron. The water caused no physical injury, but the second patron was wearing contact lenses that became dislodged, causing temporary blurred vision. The second patron also experienced humiliation.",
    question: "If the second patron sues for battery, will the claim succeed?",
    choices: ["No, because throwing water cannot constitute harmful or offensive contact.", "No, because the second patron did not suffer significant physical injury.", "Yes, because the first patron intended to cause a harmful or offensive contact.", "Yes, but only if the first patron knew about the contact lenses."],
    correct: 2,
    explanations: ["Incorrect. Throwing water in someone's face is widely recognized as offensive contact.", "Incorrect. Battery does not require significant physical injury. It protects bodily integrity and personal dignity.", "Correct. Battery requires an intentional act that causes harmful or offensive contact. Throwing water in someone's face is clearly offensive. A reasonable person would find it an affront to personal dignity.", "Incorrect. Battery requires intent to cause the contact itself, not intent to cause the specific harm. The eggshell plaintiff rule applies."]
  },
  {
    id: "t5", subject: "Torts", subtopic: "Negligence — Comparative Fault", difficulty: 3,
    stem: "A cyclist was riding at night without lights or reflective gear, violating a local ordinance. A motorist, driving 10 mph over the speed limit while texting, struck the cyclist. The cyclist suffered $100,000 in damages. The jury found the cyclist 40% at fault and the motorist 60% at fault. The jurisdiction follows modified comparative fault with a 50% bar.",
    question: "How much can the cyclist recover?",
    choices: ["$100,000, because the motorist was more at fault.", "$60,000, because recovery is reduced by the cyclist's percentage of fault.", "$40,000, because the cyclist can only recover the motorist's proportionate share.", "Nothing, because the cyclist's ordinance violation constitutes contributory negligence as a matter of law."],
    correct: 1,
    explanations: ["Incorrect. Under comparative fault, recovery is reduced by the plaintiff's own percentage of fault.", "Correct. Under modified comparative fault with a 50% bar, the cyclist can recover because 40% fault is below the threshold. Total damages of $100,000 are reduced by 40%, yielding $60,000.", "Incorrect. This confuses comparative fault with contribution among joint tortfeasors.", "Incorrect. This jurisdiction follows comparative fault, not contributory negligence."]
  },
  {
    id: "c6", subject: "Contracts", subtopic: "Promissory Estoppel", difficulty: 3,
    stem: "A nonprofit was seeking to build a community center. A wealthy donor orally promised to contribute $500,000. Based on this, the nonprofit hired an architect for $40,000, purchased land for $200,000, and began construction costing $60,000. Six months later, the donor refused to donate. The nonprofit sued.",
    question: "Under promissory estoppel, what is the most likely recovery amount?",
    choices: ["$500,000, because the promise should be enforced fully.", "$300,000, representing the nonprofit's actual expenditures made in reliance.", "Nothing, because charitable pledges require consideration.", "Nothing, because the promise was oral."],
    correct: 1,
    explanations: ["Incorrect. Promissory estoppel typically limits recovery to reliance damages, not full expectation damages.", "Correct. Under Restatement Second section 90, the remedy is limited as justice requires, typically to reliance damages. The nonprofit incurred $300,000 in foreseeable reliance expenditures.", "Incorrect. Promissory estoppel exists precisely to enforce promises that lack consideration when justice demands it.", "Incorrect. Promissory estoppel does not require a writing."]
  },
  {
    id: "t6", subject: "Torts", subtopic: "Negligence — Res Ipsa Loquitur", difficulty: 3,
    stem: "A patient underwent routine knee surgery under general anesthesia. When she woke up, she had a severe burn on her shoulder, an area unrelated to the surgery. She was unconscious throughout the procedure. She sued but could not identify which team member caused the burn or how it occurred.",
    question: "Can the patient establish a prima facie case of negligence?",
    choices: ["No, because she cannot prove which defendant caused the injury.", "No, because she must provide expert testimony establishing the specific act of negligence.", "Yes, under res ipsa loquitur, because the burn would not ordinarily occur without negligence.", "Yes, but only if the hospital had a history of similar incidents."],
    correct: 2,
    explanations: ["Incorrect. Res ipsa loquitur was developed precisely for situations where the plaintiff cannot identify the precise cause.", "Incorrect. Res ipsa loquitur can eliminate the need for expert testimony when the injury obviously would not occur without negligence.", "Correct. All three elements are satisfied: burns unrelated to the surgical site do not occur without negligence, the surgical environment was under exclusive control of the medical team, and the unconscious patient could not have contributed to the injury.", "Incorrect. A history of similar incidents is not required for res ipsa loquitur."]
  },
  {
    id: "c7", subject: "Contracts", subtopic: "Conditions & Performance", difficulty: 2,
    stem: "A homeowner contracted with a painter to paint the exterior of her house for $8,000. The contract specified WeatherShield Premium brand paint, with payment due upon completion. The painter completed the job but used ProCoat Elite paint instead, a comparable brand of equal quality and price. The homeowner refused to pay anything.",
    question: "Can the painter recover payment?",
    choices: ["Yes, for the full $8,000, because the substituted paint was of equal quality.", "Yes, under substantial performance, but the homeowner may offset any damages caused by the deviation.", "No, because the brand specification was an express condition.", "No, because the deviation was a material breach."],
    correct: 1,
    explanations: ["Incorrect. A party cannot recover the full price when they have deviated from contract specifications.", "Correct. Under substantial performance, the painter completed the entire job using equivalent paint. The deviation does not defeat the essential purpose of the contract. The homeowner may offset actual damages but cannot refuse to pay entirely.", "Incorrect. General specifications are typically treated as promises unless explicitly made conditions precedent to payment.", "Incorrect. Substitution of an equivalent product does not rise to the level of material breach."]
  }
];

function getSubtopics(subject) {
  return [...new Set(QUESTIONS.filter(q => q.subject === subject).map(q => q.subtopic))];
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
  const [selectedAnswer, setSelectedAnswer] = useState(null);
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
    const filteredResponses = subject ? responses.filter(r => { const q = QUESTIONS.find(q2 => q2.id === r.questionId); return q && q.subject === subject; }) : responses;
    const filteredIds = subject ? new Set([...answeredIds].filter(id => { const q = QUESTIONS.find(q2 => q2.id === id); return q && q.subject === subject; })) : answeredIds;
    const next = selectNextQuestion(filteredResponses, filteredIds);
    if (!next) {
      if (subject) {
        const newIds = new Set([...answeredIds].filter(id => { const q = QUESTIONS.find(q2 => q2.id === id); return !q || q.subject !== subject; }));
        setAnsweredIds(newIds);
        setCurrentQuestion(selectNextQuestion(filteredResponses, new Set()));
      } else {
        setAnsweredIds(new Set());
        setCurrentQuestion(selectNextQuestion(responses, new Set()));
      }
    } else { setCurrentQuestion(next); }
    setSelectedAnswer(null);
    setShowResult(false);
    setQuestionStartTime(Date.now());
    setScreen("study");
  }, [responses, answeredIds]);

  const submitAnswer = useCallback((choiceIndex) => {
    if (showResult) return;
    setSelectedAnswer(choiceIndex);
    setShowResult(true);
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    const isCorrect = choiceIndex === currentQuestion.correct;
    setResponses(prev => [...prev, { questionId: currentQuestion.id, selected: choiceIndex, correct: isCorrect, timeSpent, timestamp: Date.now() }]);
    setAnsweredIds(prev => new Set([...prev, currentQuestion.id]));
    setSessionCount(prev => prev + 1);
  }, [showResult, questionStartTime, currentQuestion]);

  const nextQuestion = useCallback(() => {
    const subjectQuestions = studySubject ? QUESTIONS.filter(q => q.subject === studySubject) : QUESTIONS;
    const subjectIds = new Set(subjectQuestions.map(q => q.id));
    const filteredAnswered = new Set([...answeredIds].filter(id => subjectIds.has(id)));
    let next = selectNextQuestion(studySubject ? responses.filter(r => subjectIds.has(r.questionId)) : responses, filteredAnswered);
    if (!next) {
      const newIds = new Set([...answeredIds].filter(id => !subjectIds.has(id)));
      setAnsweredIds(newIds);
      next = selectNextQuestion(studySubject ? responses.filter(r => subjectIds.has(r.questionId)) : responses, new Set());
    }
    setCurrentQuestion(next);
    setSelectedAnswer(null);
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
    const subjects = [...new Set(QUESTIONS.map(q => q.subject))];
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
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
    const choiceLabels = ["A", "B", "C", "D"];
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
              <p style={{ fontSize: 15, lineHeight: 1.75, margin: "0 0 16px" }}>{q.stem}</p>
              <p style={{ fontSize: 15, lineHeight: 1.75, margin: 0, fontWeight: 600 }}>{q.question}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.choices.map((choice, i) => {
                let bg = colors.surface, borderColor = colors.border, labelBg = "rgba(255,255,255,0.06)", labelColor = colors.textMuted;
                if (showResult) {
                  if (i === q.correct) { bg = colors.correctBg; borderColor = colors.correct; labelBg = colors.correct; labelColor = "#fff"; }
                  else if (i === selectedAnswer) { bg = colors.incorrectBg; borderColor = colors.incorrect; labelBg = colors.incorrect; labelColor = "#fff"; }
                }
                return (
                  <div key={i} onClick={() => submitAnswer(i)} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: bg, border: "1px solid " + borderColor, borderRadius: 10, padding: "14px 16px", cursor: showResult ? "default" : "pointer" }}>
                    <span style={{ minWidth: 28, height: 28, borderRadius: 6, background: labelBg, color: labelColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{choiceLabels[i]}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.65 }}>{choice}</span>
                  </div>
                );
              })}
            </div>
            {showResult && (
              <div style={{ marginTop: 24 }}>
                <div style={{ ...baseStyles.card, borderColor: selectedAnswer === q.correct ? colors.correct : colors.incorrect, borderLeftWidth: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: selectedAnswer === q.correct ? colors.correct : colors.incorrect, fontSize: 14, fontWeight: 700 }}>
                    {selectedAnswer === q.correct ? "✓ Correct" : "✗ Incorrect"}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.75, margin: 0 }}>{q.explanations[selectedAnswer]}</p>
                  {selectedAnswer !== q.correct && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid " + colors.border }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: colors.correct, marginBottom: 8 }}>Why {choiceLabels[q.correct]} is correct:</div>
                      <p style={{ fontSize: 14, lineHeight: 1.75, color: colors.textMuted, margin: 0 }}>{q.explanations[q.correct]}</p>
                    </div>
                  )}
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
              <p style={{ fontSize: 14, color: colors.textMuted, margin: "0 0 16px", lineHeight: 1.6 }}>Target: ~1.8 minutes per MBE question (108 seconds). Your average: <strong style={{ color: colors.text }}>{stats.avgTime}s</strong></p>
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
