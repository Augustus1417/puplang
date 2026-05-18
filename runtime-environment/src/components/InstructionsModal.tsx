import { useState } from "react";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>("variables");

  const tabs = [
    { id: "variables", label: "Variables" },
    { id: "assignment", label: "Assignment" },
    { id: "print", label: "Print" },
    { id: "conditions", label: "Conditions" },
    { id: "loops", label: "Loops" },
    { id: "input", label: "Input" },
    { id: "functions", label: "Functions" },
  ];

  const content: Record<string, { description: string; syntax: string }> = {
    variables: {
      description: "Create variables to store data",
      syntax: `# Declare a variable
make num1
make name
make count`,
    },
    assignment: {
      description: "Assign values to variables",
      syntax: `# Assignment
num1 gets 1
num2 gets 2
name gets "John"
var gets True`,
    },
    print: {
      description: "Display output to the console",
      syntax: `# Print a string
say "Hello World"

# Print variable values
say name

# Print expressions
say num1 + num2

# Print multiple values
say "The answer is" , num1 + num2`,
    },
    conditions: {
      description: "Execute code based on conditions",
      syntax: `# Simple condition
when num1 is 1
  say "Number is 1"
end

# Multiple conditions
when num1 is 1
  say "It is 1"
otherwise when num1 is 2
  say "It is 2"
otherwise when num1 > 3
  say "It is greater than 3"
end

# Comparison operators: is, is not, <, >, <=, >=`,
    },
    loops: {
      description: "Repeat code blocks",
      syntax: `# Loop from 0 to 10
count i from 0 to 10
  say i
end

# Loop with step
count i from 0 to 20
  say i
end

# Note: Loop variable i is accessible inside the loop`,
    },
    input: {
      description: "Get user input",
      syntax: `# Input a number
make num
num asks number "Enter a number:"
say num

# Input a string
make word
word asks string "Enter text:"
say word`,
    },
    functions: {
      description: "Define and call reusable functions",
      syntax: `# Define a function
task sample_function()
  say "This is a function"
  return "done"
end

# Define a function with parameters
task add(num1, num2)
  say num1 + num2
  return num1 + num2
end

# Call functions
say sample_function()
add(1, 2)
result gets add(5, 3)`,
    },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">PupLang Manual</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded px-2 py-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-800 px-4 pt-3 border-b border-gray-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="text-xl font-semibold text-white mb-3">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h3>
          <p className="text-gray-300 mb-4">{content[activeTab].description}</p>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-words">
              {content[activeTab].syntax}
            </pre>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            💡 Try these examples in the editor above. Run your code to see it in action!
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-3 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
