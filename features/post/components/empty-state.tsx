import { CalendarDays } from "lucide-react";

const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
    <div className="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-4">
      <CalendarDays className="text-gray-300 w-7 h-7" strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-bold text-gray-800">{title}</h3>
    <p className="text-sm text-gray-400 mt-1 mb-5 max-w-xs">{description}</p>
    {action}
  </div>
);

export default EmptyState