type ErrorMessageProps = {
  message: string | null;
};

export const ErrorMessage = ({ message }: ErrorMessageProps) =>
  message ? <p className="error">{message}</p> : null;
