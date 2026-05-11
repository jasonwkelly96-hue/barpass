import json

with open("app/questions.json") as f:
    d = json.load(f)

ids = set(q["id"] for q in d)

new = [
  {"id":"tor-015","subject":"Torts","subtopic":"Negligence - Emotional Distress","difficulty":2,"selectCount":1,
   "stem":"A mother watched from across the street as a speeding car struck and killed her young child in a crosswalk. She was never in physical danger but suffered severe emotional trauma and PTSD.",
   "question":"Can the mother recover for negligent infliction of emotional distress?",
   "choices":["No, not in zone of danger.","No, emotional distress without impact is never compensable.","Yes, close family member who contemporaneously witnessed the event.","Yes, but only with physical injury."],
   "correct":[2],
   "explanations":["Incorrect. Many jurisdictions use the bystander test, not zone of danger.","Incorrect. Bystander recovery is widely recognized.","Correct. Under the bystander rule, a closely related plaintiff who contemporaneously witnesses the injury may recover for serious emotional distress.","Incorrect. Physical injury not required under bystander test."]},

  {"id":"con-012","subject":"Contracts","subtopic":"Anticipatory Repudiation","difficulty":2,"selectCount":1,
   "stem":"A singer contracted to perform on December 15 for $50,000. On November 1 she repudiated. The venue hired a replacement for $65,000. On November 20 the singer retracted her repudiation.",
   "question":"Must the venue allow the singer to perform?",
   "choices":["Yes, retraction was before performance date.","Yes, duty to mitigate requires accepting retraction.","No, venue materially changed position before retraction.","No, anticipatory repudiation can never be retracted."],
   "correct":[2],
   "explanations":["Incorrect. Right to retract is lost once the other party materially changes position.","Incorrect. Mitigation does not require accepting a retraction after substitute arrangements are made.","Correct. Repudiation may be retracted until the aggrieved party materially changes position. Hiring a replacement constitutes material change.","Incorrect. Repudiation can be retracted, but only before material reliance."]},

  {"id":"evi-011","subject":"Evidence","subtopic":"Privileges","difficulty":2,"selectCount":1,
   "stem":"During a fraud trial, plaintiff sought to compel testimony about a conversation between defendant and his attorney. The defendant's adult daughter was also present in the room.",
   "question":"Is the conversation privileged?",
   "choices":["Yes, all attorney communications are privileged.","Yes, if the daughter was present to assist the consultation.","No, third party presence destroys privilege.","No, privilege does not apply in civil cases."],
   "correct":[1],
   "explanations":["Incorrect. Only confidential communications for legal advice are privileged.","Correct. A third party present to further the consultation does not destroy the privilege.","Incorrect. Third party presence does not automatically destroy privilege if they assist the consultation.","Incorrect. Privilege applies in both civil and criminal cases."]},

  {"id":"crm-013","subject":"Criminal Law","subtopic":"Felony Murder","difficulty":3,"selectCount":1,
   "stem":"Three men planned a bank robbery. During it, one shot and killed a guard. The second was the getaway driver. The third provided guns but stayed home.",
   "question":"Who can be charged with felony murder?",
   "choices":["Only the shooter.","Shooter and driver, not the gun supplier.","All three, as participants in the underlying felony.","None, felony murder requires premeditation."],
   "correct":[2],
   "explanations":["Incorrect. Felony murder extends to all participants.","Incorrect. The gun supplier was a co-conspirator and participant.","Correct. All participants in an inherently dangerous felony are liable for killings during its commission.","Incorrect. Felony murder does not require premeditation."]},

  {"id":"civ-025","subject":"Civil Procedure","subtopic":"Personal Jurisdiction","difficulty":2,"selectCount":1,
   "stem":"Plaintiff from State A sued defendant from State B in State A federal court. Defendant has no physical presence in State A but sold defective goods to plaintiff through a website and shipped them to State A.",
   "question":"Does State A have personal jurisdiction?",
   "choices":["Yes, website accessible in State A.","Yes, purposefully directed commercial activity toward State A.","No, no physical presence.","No, websites alone are insufficient."],
   "correct":[1],
   "explanations":["Incorrect. A nationally accessible website alone is not enough.","Correct. Selling and shipping goods to State A constitutes purposeful direction of commercial activity, establishing specific jurisdiction.","Incorrect. Physical presence is not required for personal jurisdiction.","Incorrect. Interactive commercial websites with forum-state transactions can establish jurisdiction."]}
]

added = 0
for q in new:
    if q["id"] not in ids:
        d.append(q)
        added += 1

with open("app/questions.json", "w") as f:
    json.dump(d, f, indent=2)

print(f"Added {added}. Total: {len(d)}")