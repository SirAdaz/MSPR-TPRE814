"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { SensorReading } from "@/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
  readings: SensorReading[];
}

export function ReadingChart({ readings }: Props) {
  const labels = readings.map((reading) => new Date(reading.recorded_at).toLocaleString());
  const data = {
    labels,
    datasets: [
      {
        label: "Temperature",
        data: readings.map((reading) => reading.temperature),
        borderColor: "rgb(255, 99, 132)",
      },
      {
        label: "Humidity",
        data: readings.map((reading) => reading.humidity),
        borderColor: "rgb(54, 162, 235)",
      },
    ],
  };
  return <Line data={data} />;
}
