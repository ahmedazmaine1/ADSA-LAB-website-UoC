/* =========================================================
   DANSA Lab — members data (SINGLE SOURCE OF TRUTH)
   Edit this file; the Members page + group counts + Alumni
   section all update automatically (rendered by js/members.js).

   • add a member                 → add an object
   • promote (BSc→MSc→PhD)        → change `group` (moves section + label)
   • retire someone               → set `alumni: true`
   Fields: name (req), group (one of groupOrder), role (optional — defaults
   to the group's singular), photo (in images/), bio (in pages/), alumni.
   ========================================================= */
window.LAB = window.LAB || {};

window.LAB.groupOrder = [
    "Professors",
    "PhD Students",
    "MSc Students",
    "BSc Students",
    "External Collaborators",
];

window.LAB.members = [
    { name: "Reda Alhajj", group: "Professors", photo: "Reda_Alhajj.png", bio: "prof_reda_alhajj.html" },
    { name: "Jon Rokne", group: "Professors", photo: "Jon_Rokne.png", bio: "prof_jon_rokne.html" },

    { name: "Ahmed Al Marouf", group: "PhD Students", role: "PhD Candidate", photo: "Ahmed_Al_Marouf.png", bio: "ahmed_al_marouf.html", alumni: true },
    { name: "Abdullah Elsheikh", group: "PhD Students", photo: "abdullah_elsheikh.png", bio: "abdullah_elsheikh.html" },

    { name: "Annette John", group: "MSc Students", photo: "Annette_john.png", bio: "Annette_John.html" },
    { name: "Adnan Ferdous Ashrafi", group: "MSc Students", photo: "adnan_ferdous_ashrafi.png", bio: "adnan_ferdous_ashrafi.html" },
    { name: "Sara Imani", group: "MSc Students", photo: "sara_imani.png", bio: "sara_imani.html" },
    { name: "Roy Li", group: "MSc Students", photo: "Roy_Li.png" },

    { name: "Falah Sheikh", group: "BSc Students", photo: "falah_sheikh.png", bio: "falah_sheikh.html", alumni: true },
    { name: "Caio Vinicius", group: "BSc Students", photo: "Caio_vinicius.png", bio: "caio_vinicius.html" },
    { name: "Sheikh Muhammad Mazin", group: "BSc Students", photo: "Mazin.png", bio: "mazin.html" },
    { name: "Ahmed Azmaine Alvee", group: "BSc Students", photo: "Ahmed_Azmaine_Alvee.png" },

    { name: "Kiana Bindra", group: "External Collaborators", photo: "collab-1.jpg" },
];
