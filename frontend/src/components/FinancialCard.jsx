import React from "react";

const FinancialCard = ({
  icon,
  label,
  value,
  additionalContent,
  borderColor = "",
  bgColor = "bg-white",
}) => {
  return (
    <div
      className={`${bgColor} rounded-xl mt-5 p-5 lg:-mx-2 lg:p-2 shadow-lg border hover:shadow-blue-300 border-blue-300 transition-all ${borderColor}`}
    >
      <div className="text-sm font-medium text-gray-600 flex items-center gap-2">
        {icon}
        {label}
      </div>

      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>

      {additionalContent}
    </div>
  );
};

export default FinancialCard;
