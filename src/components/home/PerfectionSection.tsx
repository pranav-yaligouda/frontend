
import { CheckCircle, Truck, Clock, Shield } from "lucide-react";

interface PerfectionSectionProps {
  title: string;
  description: string;
  features: {
    icon: "check" | "truck" | "clock" | "shield";
    title: string;
    description: string;
  }[];
  bgColor?: string;
}

const iconMap = {
  check: CheckCircle,
  truck: Truck,
  clock: Clock,
  shield: Shield,
};

const PerfectionSection = ({ title, description, features, bgColor = "bg-gray-50" }: PerfectionSectionProps) => {
  return (
    <section className={`py-16 ${bgColor}`}>
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon];
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PerfectionSection;
