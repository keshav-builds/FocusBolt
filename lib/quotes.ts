const QUOTES = [
  { text: "Small steps every day lead to big results.", author: "Unknown" },
  { text: "Focus is the art of knowing what to ignore.", author: "James Clear" },
  { text: "You don’t need more time, you just need to decide.", author: "Seth Godin" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Action breeds confidence and courage.", author: "Dale Carnegie" },
  { text: "Discipline is destiny.", author: "Ryan Holiday" },
  { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
  { text: "Well begun is half done.", author: "Aristotle" },
]

export function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)]
}
