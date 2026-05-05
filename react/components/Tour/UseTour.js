import { TourProvider } from "@reactour/tour";

export default function UseTour({ steps, children }) {
  return (
    <TourProvider
      steps={steps}
      defaultOpen
      styles={{
        popover: base => ({
          ...base,
          zIndex: 10000000
        })
      }}
    >
      {children}
    </TourProvider>
  );
}