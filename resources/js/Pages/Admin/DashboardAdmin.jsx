import React from 'react';
import { usePage } from '@inertiajs/react';
import LayoutAdmin from '../../layout/LayoutAdmin';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../../components/admin/DashboardAdmin/Header';
import Stats from '../../components/admin/DashboardAdmin/Stats';
import QuickActions from '../../components/admin/DashboardAdmin/QuickActions';
import Chart from '../../components/admin/DashboardAdmin/Chart';
import RecentActivities from '../../components/admin/DashboardAdmin/RecentActivities';

const DashboardAdmin = () => {
    const { currentTheme } = useTheme();
    const { stats = [], recentActivities = [], chartData = [] } = usePage().props;

    return (
        <LayoutAdmin>
            <div className="space-y-12">
                {/* Header Card */}
                <Header currentTheme={currentTheme} />

                {/* Stats Grid */}
                <Stats stats={stats} currentTheme={currentTheme} />

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activities */}
                    <RecentActivities recentActivities={recentActivities} currentTheme={currentTheme} />

                    {/* Quick Actions */}
                    <QuickActions currentTheme={currentTheme} />
                </div>

                {/* Chart Section */}
                <Chart currentTheme={currentTheme} chartData={chartData} />
            </div>
        </LayoutAdmin>
    );
};

export default DashboardAdmin;