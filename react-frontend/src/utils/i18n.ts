import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
        en:{
            translation:{
                creation:"Event Creation",
                access:"Access Event",
                creating:"Creating Event...",
                create:"Create Event",
                event_name:"Event Name",
                dashboard:"Admin Dashboard",
                voter_login:"Login",
                login:"Login",
                logout:"Logout",
                voter_logout:"Voter Logout",
                logged_out: "Logged out",
                accessing: "Accessing Event...",
                live:"Live Results",
                dashboard_403:"Please create or access an event first to access the admin dashboard.",
                back:"Back",
                event_id:"Event ID",
                password:"Password",
                voterLogin:"Voter Login",
                submitVote:"Submit Vote",
                submitted:"Vote Submitted",
                submitting:'Submitting vote...',
                cast:"Cast Your Vote",
                tap2select:"Tap to select",
                selected:"Selected",
                recorded:'Your vote has been recorded. Thank you!',
                view:"View Live Results",
                username:'Username',
                login_phrase:"Enter your username and password",
                use:'Use credentials provided by admin',
            }
        },
        mm: {
            translation: {
                creation: "Event ဖန်တီးခြင်း",
                access: "Event ဝင်ရောက်မည်",
                creating: "Event ဖန်တီးနေသည်...",
                create: "Event ဖန်တီးမည်",
                event_name: "Event အမည်",
                dashboard: "အက်မင် ဒက်ရှ်ဘုတ်",
                login: "ဝင်ရောက်မည်",
                voter_login:"မဲပေးသူအဖြစ် ဝင်ရောက်မည်",
                voter_logout: "ထွက်မည်",
                logged_out: "ထွက်ပြီးပါပြီ",
                accessing: "Event ဝင်ရောက်နေသည်...",
                logout: "ထွက်မည်",
                live:"တိုက်ရိုက်ရလဒ်များ",
                dashboard_403:"Event အသစ်တစ်ခုပြုလုပ်ပါ သို့မဟုတ် ဝင်ရောက်ပြီးမှ အက်မင် ဒက်ရှ်ဘုတ်သို့ ဝင်ရောက်နိုင်ပါသည်။",
                back:"နောက်သို့",
                event_id:"Event ID",
                password:"လျှို့ဝှက်နံပါတ်",
                voterLogin:"မဲပေးသူအဖြစ် ဝင်ရောက်မည်",
                submitVote:"မဲပေးမည်",
                submitted:"မဲပေးပြီးပါပြီ",
                submitting:'မဲပေးနေပါသည်',
                cast:"သင် ရွေးချယ်ထားသော မဲဆန္ဒရှင်အားမဲပေးပါ",
                tap2select:"ရွေးချယ်ရန် နှိပ်ပါ",
                selected:"ရွေးချယ်ပြီးပါပြီ",
                recorded:'သင့်မဲအား မှတ်တမ်းတင်ပြီးပါပြီ၊ ကျေးဇူးတင်ပါသည်။',
                view:'မဲရလဒ်အားတိုက်ရိုက်ကြည့်ရှုရန်',
                username:'အသုံးပြုသူအမည်',
                login_phrase:'သင်၏အသုံးပြုသူအမည်နှင့်လျှို့ဝှက်နံပါတ်အားထည့်သွင်းပါ',
                use:'အက်ဒမင်မှပေးထားသောအချက်အလက်များအားအသုံးပြုပါ'
            }
        }
}

// Initialize i18n with the in-memory resources and the language detector.
// We intentionally do NOT use the http backend here since translations are embedded.
i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    // available languages and fallback
    // include both 'mm' and the common IETF tag 'my' so browser detection matches either
    supportedLngs: ['en', 'mm', 'my'],
    // if the browser reports 'my' (Burmese), fall back to the bundled 'mm' translations
    fallbackLng: { 'my': ['mm'], 'default': ['en'] },
    ns: ['translation'],
    defaultNS: 'translation',
    debug: true,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;