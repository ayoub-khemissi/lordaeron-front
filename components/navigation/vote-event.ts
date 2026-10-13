// the vote panel (components/vote-panel.tsx) opens on this window event: the top bar's, the burger's and the footer's "Vote"
export const OPEN_VOTE_EVENT = "lordaeron:open-vote";

export const openVote = () => window.dispatchEvent(new Event(OPEN_VOTE_EVENT));
