import React from "react";

interface CaseInfoProps {
  title: string;
  description: string;
  keyPoints: string[];
}

export const CaseInfo: React.FC<CaseInfoProps> = ({ title, description, keyPoints }) => {
  return (
    <div className="bg-blue-50 p-4 border-b border-blue-200">
      <h3 className="font-bold text-blue-800 mb-2">Case Information</h3>
      <div className="space-y-2">
        <p><span className="font-semibold">Title:</span> {title}</p>
        <p><span className="font-semibold">Description:</span> {description}</p>
        <div>
          <span className="font-semibold">Key Points:</span>
          <ul className="list-disc list-inside ml-4">
            {keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
        <div>
          <span className="font-semibold">Tips:</span>
          <ul className="list-disc list-inside ml-4">
            <li>Mention specific evidence to strengthen your case</li>
            <li>Question the credibility of opposing witnesses</li>
            <li>Use legal precedents when possible</li>
            <li>Avoid making emotional arguments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 