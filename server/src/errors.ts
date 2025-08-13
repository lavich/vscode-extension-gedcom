export const ValidateErrorCode = {
  CODE000: "SHOULD_HAVE_TAG",
  CODE001: "test",
} as const;

type ErrorCode = keyof typeof ValidateErrorCode;
