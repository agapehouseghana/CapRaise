import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MemberStatsBarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400} className="py-10">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#a400b4" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MemberStatsBarChart;


