export const TRIGGER_PHRASES = [
  { text: "as per the report, ", route: "retrieve" },
  { text: "according to the document, ", route: "retrieve" },
  { text: "what does the paper say about ", route: "retrieve" },
  { text: "based on the uploaded file, ", route: "retrieve" },
  { text: "verify this claim: ", route: "verify_claim" },
  { text: "is this claim still valid: ", route: "verify_claim" },
  {
    text: "has this been superseded by newer research: ",
    route: "verify_claim",
  },
];
