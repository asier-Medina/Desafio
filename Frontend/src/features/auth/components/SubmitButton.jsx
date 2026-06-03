import Button from "@ui/Button";

export default function SubmitButton({ children, loading, ...props }) {
  return (
    <Button
      type="submit"
      variant="accent"
      size="lg"
      fullWidth
      loading={loading}
      disabled={loading}
      {...props}
    >
      {children}
    </Button>
  );
}
