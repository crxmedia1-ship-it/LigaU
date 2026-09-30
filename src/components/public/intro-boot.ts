/** Set to true to show the intro only once per browser session. */
export const INTRO_ONCE_PER_SESSION = false;

export const INTRO_KEY = "ligau-intro";
export const INTRO_SEEN_CLASS = "ligau-intro-seen";

export const INTRO_BOOT_SCRIPT = `try{var s=sessionStorage;if(s.getItem("${INTRO_KEY}")||location.pathname!=="/"){s.setItem("${INTRO_KEY}","1");document.documentElement.classList.add("${INTRO_SEEN_CLASS}")}}catch(e){}`;
