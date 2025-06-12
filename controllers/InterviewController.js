const Interview = require("../models/interviewSchema");
const mongoose = require("mongoose");
const userModel=require("../models/userSchema")
const Offre=require("../models/offreSchema")

/// Helper function to check if a string is a valid URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { oauth2Client } = require("../utils/googleOAuth");
const moment = require("moment-timezone");

function generateICS(event) {
  const start = moment(event.start).utc().format("YYYYMMDDTHHmmss") + "Z";
  const end = moment(event.end).utc().format("YYYYMMDDTHHmmss") + "Z";

  return `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Company//Your App//FR
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${event.uid}
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.summary}
DESCRIPTION:${event.description}
LOCATION:${event.location}
STATUS:CONFIRMED
ORGANIZER;CN=RH Team:mailto:${process.env.EMAIL_USER}
ATTENDEE;CN=Candidate;RSVP=TRUE:mailto:${event.attendee}
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Reminder 30 minutes before
END:VALARM
BEGIN:VALARM
TRIGGER:-PT5M
ACTION:DISPLAY
DESCRIPTION:Reminder 5 minutes before
END:VALARM
END:VEVENT
END:VCALENDAR
`.trim();
}

exports.createInterview = async (req, res) => {
  try {
    const { offer, date, time, location, email, timezone = "Europe/Paris" } = req.body;

    if (!email || !offer || !date || !time || !location) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const startDateTime = moment.tz(`${date}T${time}`, timezone).toDate();
    const endDateTime = moment(startDateTime).add(2, "hours").toDate();

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    if (!oauth2Client.credentials.access_token || oauth2Client.isTokenExpiring()) {
      await oauth2Client.getAccessToken();
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: `Entretien RH`,
      location,
      description: `Entretien planifié via l'application RH.`,
      start: { dateTime: startDateTime.toISOString(), timeZone: timezone },
      end: { dateTime: endDateTime.toISOString(), timeZone: timezone },
      attendees: [{ email }],
      conferenceData: {
        createRequest: {
          requestId: `interview-${Math.random().toString(36).substring(2, 12)}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const createdEvent = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink =
      createdEvent.data.conferenceData?.entryPoints?.find(
        (ep) => ep.entryPointType === "video"
      )?.uri || "Lien non disponible";

    // Save interview
    const interview = await Interview.create({
      offer,
      date,
      time,
      location,
      email,
      meetLink,
      status: "Planifié",
      recrut: req.user?.id || null,
    });

    // Populate offer to get titre
    const populatedInterview = await Interview.findById(interview._id).populate("offer");
    const offerTitle = populatedInterview.offer?.titre || "Titre non disponible";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🎯 Invitation for a Interview - RH",
      html: `
        <div style="background-color: #f5f6fa; padding: 30px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <div style="background-color: #4a90e2; padding: 20px; color: white; text-align: center;">
              <h1 style="margin: 0;">📅 HR Interview</h1>
              <p style="margin: 5px 0 0;">Your interview is scheduled"</p>
            </div>

            <div style="padding: 30px; color: #333;">
              <p style="font-size: 16px;">Hello</p>

              <p style="font-size: 16px;">
                You have an interview on  <strong>${date}</strong> à <strong>${time}</strong> .
              </p>

              <table style="width: 100%; margin: 20px 0; font-size: 16px;">
                <tr>
                  <td style="padding: 8px 0;"><strong>🕒 Time  :</strong></td>
                  <td style="padding: 8px 0;">${time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>📍 Location  :</strong></td>
                  <td style="padding: 8px 0;">${location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>📌 Proposed post:</strong></td>
                  <td style="padding: 8px 0; color: #4a90e2;">${offerTitle}</td>
                </tr>
              </table>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${meetLink}" target="_blank" style="background-color: #4a90e2; color: white; padding: 14px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                  📹 Join the interview </br>
                  
                            via Google Meet
                </a>
              </div>

              <p style="font-size: 16px;">
                Thank you and see you soon,<br/>
                <strong>HR Team</strong>
              </p>
            </div>

            <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 13px; color: #888;">
              © ${new Date().getFullYear()} Plateforme RH. Tous droits réservés.
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Entretien créé avec succès, lien Meet généré, email envoyé 🎉",
      interview: populatedInterview,
      googleEventId: createdEvent.data.id,
    });
  } catch (err) {
    console.error("❌ Erreur création ou email :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};





exports.getInterviewsByRecruiter = async (req, res) => {
  try {
    const recruiterId = req.user.id || req.user._id;

    if (!recruiterId) {
      return res.status(401).json({ message: "Recruiter not authenticated" });
    }

    const interviews = await Interview.find({ recrut: recruiterId })
      .populate("offer", "titre")
      .populate("recrut", "username email")
      .exec();

    res.status(200).json(interviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};


exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find(recrut=req.user.id)
      .populate("offer", "titre")           // populate the offer title
      .populate("recrut", "username email") // populate recruiter info
      .populate("candidate", "username email"); // populate candidate info

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get interview by ID
exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("offre", "titre")
      .populate("candidate", "username email")
      .populate("recruiter", "username email");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get interviews by user (candidate or recruiter)
exports.getInterviewsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const interviews = await Interview.find({
      $or: [{ candidate: userId }, { recruiter: userId }],
    })
      .populate("offre", "titre")
      .populate("candidate", "username email")
      .populate("recruiter", "username email");

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get interviews by offer
exports.getInterviewsByOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId;
    const interviews = await Interview.find({ offre: offerId })
      .populate("offre", "titre")
      .populate("candidate", "username email")
      .populate("recruiter", "username email");

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update interview (status, notes, feedback)
exports.updateInterview = async (req, res) => {
  try {
    const { status, notes, feedback, date, location } = req.body;

    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { status, notes, feedback, date, location },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete interview
exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json({ message: "Interview deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// // const nodemailer = require("nodemailer");
// // const { google } = require("googleapis");

// // const { oauth2Client } = require("../utils/googleOAuth");
// // const moment = require("moment-timezone"); // install with npm i moment-timezone

// // function generateICS(event) {
// //   const start = moment(event.start).utc().format("YYYYMMDDTHHmmss") + "Z";
// //   const end = moment(event.end).utc().format("YYYYMMDDTHHmmss") + "Z";

// //   return `
// // BEGIN:VCALENDAR
// // VERSION:2.0
// // PRODID:-//Your Company//Your App//FR
// // CALSCALE:GREGORIAN
// // METHOD:REQUEST
// // BEGIN:VEVENT
// // UID:${event.uid}
// // DTSTAMP:${start}
// // DTSTART:${start}
// // DTEND:${end}
// // SUMMARY:${event.summary}
// // DESCRIPTION:${event.description}
// // LOCATION:${event.location}
// // STATUS:CONFIRMED
// // ORGANIZER;CN=RH Team:mailto:${process.env.EMAIL_USER}
// // ATTENDEE;CN=Candidate;RSVP=TRUE:mailto:${event.attendee}
// // BEGIN:VALARM
// // TRIGGER:-PT30M
// // ACTION:DISPLAY
// // DESCRIPTION:Reminder 30 minutes before
// // END:VALARM
// // BEGIN:VALARM
// // TRIGGER:-PT5M
// // ACTION:DISPLAY
// // DESCRIPTION:Reminder 5 minutes before
// // END:VALARM
// // END:VEVENT
// // END:VCALENDAR
// // `.trim();
// // }

// // exports.createInterview = async (req, res) => {
// //   try {
// //     const { offer, date, time, location, email, timezone = "Europe/Paris" } = req.body;

// //     if (!email || !offer || !date || !time || !location) {
// //       return res.status(400).json({ message: "Tous les champs sont requis." });
// //     }

// //     const startDateTime = moment.tz(`${date}T${time}`, timezone).toDate();
// //     const endDateTime = moment(startDateTime).add(2, "hours").toDate(); // 🕒 2 hours duration

// //     oauth2Client.setCredentials({
// //       refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
// //     });

// //     if (!oauth2Client.credentials.access_token || oauth2Client.isTokenExpiring()) {
// //       await oauth2Client.getAccessToken();
// //     }

// //     const calendar = google.calendar({ version: "v3", auth: oauth2Client });

// //     const event = {
// //       summary: `Entretien pour l'offre: ${offer.titre}`,
// //       location,
// //       description: `Entretien planifié via l'application RH.`,
// //       start: { dateTime: startDateTime.toISOString(), timeZone: timezone },
// //       end: { dateTime: endDateTime.toISOString(), timeZone: timezone },
// //       attendees: [{ email }],
// //       conferenceData: {
// //         createRequest: {
// //           requestId: `interview-${Math.random().toString(36).substring(2, 12)}`,
// //           conferenceSolutionKey: { type: "hangoutsMeet" },
// //         },
// //       },
// //     };

// //     const createdEvent = await calendar.events.insert({
// //       calendarId: "primary",
// //       resource: event,
// //       conferenceDataVersion: 1,
// //     });

// //     const meetLink =
// //       createdEvent.data.conferenceData?.entryPoints?.find(
// //         (ep) => ep.entryPointType === "video"
// //       )?.uri || "Lien non disponible";

// //     const interview = await Interview.create({
// //       offer,
// //       date,
// //       time,
// //       location,
// //       email,
// //       meetLink,
// //       status: "Planifié",
// //       recrut: req.user?.id || null,
// //     });

// //     const transporter = nodemailer.createTransport({
// //       service: "gmail",
// //       auth: {
// //         user: process.env.EMAIL_USER,
// //         pass: process.env.EMAIL_PASS,
// //       },
// //     });

// //     const mailOptions = {
// //       from: process.env.EMAIL_USER,
// //       to: email,
// //       subject: "🎯 Invitation à un entretien - RH",
// //       html: `
// //         <div style="background-color: #f5f6fa; padding: 30px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
// //           <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
// //             <div style="background-color: #4a90e2; padding: 20px; color: white; text-align: center;">
// //               <h1 style="margin: 0;">📅 Entretien RH</h1>
// //               <p style="margin: 5px 0 0;">Votre entretien est planifié</p>
// //             </div>

// //             <div style="padding: 30px; color: #333;">
// //               <p style="font-size: 16px;">Bonjour,</p>

// //               <p style="font-size: 16px;">
// //                 Vous avez un entretien prévu le <strong>${date}</strong> à <strong>${time}</strong> (Heure locale).
// //               </p>

// //               <table style="width: 100%; margin: 20px 0; font-size: 16px;">
// //                 <tr>
// //                   <td style="padding: 8px 0;"><strong>🕒 Heure :</strong></td>
// //                   <td style="padding: 8px 0;">${time}</td>
// //                 </tr>
// //                 <tr>
// //                   <td style="padding: 8px 0;"><strong>📍 Lieu :</strong></td>
// //                   <td style="padding: 8px 0;">${location}</td>
// //                 </tr>
// //                 <tr>
// //                   <td style="padding: 8px 0;"><strong>💼 Offre :</strong></td>
// //                   <td style="padding: 8px 0;">${offer.titre}</td>
// //                 </tr>
// //               </table>

// //               <div style="text-align: center; margin: 30px 0;">
// //                 <a href="${meetLink}" target="_blank" style="background-color: #4a90e2; color: white; padding: 14px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">
// //                   📹 Rejoindre l'entretien via Google Meet
// //                 </a>
// //               </div>

// //               <p style="font-size: 16px;">
// //                 Merci et à bientôt,<br/>
// //                 <strong>L'équipe RH</strong>
// //               </p>
// //             </div>

// //             <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 13px; color: #888;">
// //               © ${new Date().getFullYear()} Plateforme RH. Tous droits réservés.
// //             </div>
// //           </div>
// //         </div>
// //       `,
// //     };

// //     await transporter.sendMail(mailOptions);

// //     res.status(201).json({
// //       message: "Entretien créé avec succès, lien Meet généré, email envoyé 🎉",
// //       interview,
// //       googleEventId: createdEvent.data.id,
// //     });
// //   } catch (err) {
// //     console.error("❌ Erreur création ou email :", err);
// //     res.status(500).json({ message: "Erreur serveur", error: err.message });
// //   }
// // }; i wnt render ofrre.titre please  i feel the desiign more advanec my teacher will punsih me hah


