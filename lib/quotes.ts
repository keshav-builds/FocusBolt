const QUOTES = [
  { text: "Set thy heart upon thy work.", author: "Bhagavad Gita" },
  { text: "Work without attachment to fruits.", author: "Bhagavad Gita" },
  { text: "Meditate to steady the mind.", author: "Bhagavad Gita" },
  { text: "Rise by your own effort.", author: "Bhagavad Gita" },
  { text: "Believe and become.", author: "Bhagavad Gita" },
  { text: "Mind can be friend or enemy.", author: "Bhagavad Gita" },
  { text: "Reshape yourself with will.", author: "Bhagavad Gita" },
  { text: "Live your own destiny.", author: "Bhagavad Gita" },
  { text: "Change is certain.", author: "Bhagavad Gita" },
  { text: "Calmness brings discipline.", author: "Bhagavad Gita" },
  { text: "Disciplined mind brings happiness.", author: "Bhagavad Gita" },
  { text: "Everything happens for good.", author: "Bhagavad Gita" },
  { text: "Stay steady in all situations.", author: "Bhagavad Gita" },
  { text: "Action is better than inaction.", author: "Bhagavad Gita" },
  { text: "Good work never ends badly.", author: "Bhagavad Gita" },
  { text: "Work for others' welfare.", author: "Bhagavad Gita" },
  { text: "Perform duty without attachment.", author: "Bhagavad Gita" },
  { text: "Follow your own path.", author: "Bhagavad Gita" },
  { text: "Wise abandon attachment.", author: "Bhagavad Gita" },
  { text: "Cut doubt with knowledge.", author: "Bhagavad Gita" },
]

export function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)]
}
