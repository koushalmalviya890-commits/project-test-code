import CustomSlider from "./CustomSlider";

export default function CummaTeam() {
  return (
    <div className="bg-gray-50">
      <div className="text-center py-8">
        <h4 className="text-md font-medium text-gray-800 mb-2">
          Why Choose Cumma's Team?
        </h4>
        <p className="text-6xl font-semibold text-gray-900 mb-4">
          Meet the{" "}
          <span className="text-green-600">Heroes</span> behind us
        </p>
        <p className="text-xl text-gray-600">
          Don’t just see what we’ve built, See who makes it happen.
        </p>
      </div>
      <CustomSlider />
    </div>
  );
}
