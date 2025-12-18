import { cn } from '@/lib/utils';

export default function StatsCard({ icon: Icon, label, value, change, color = 'primary', trend = 'up' }) {
    const colorClasses = {
        primary: 'from-primary-500 to-primary-600',
        secondary: 'from-secondary-500 to-secondary-600',
        success: 'from-green-500 to-green-600',
        warning: 'from-yellow-500 to-yellow-600',
        danger: 'from-red-500 to-red-600',
        info: 'from-blue-500 to-blue-600',
    };

    return (
        <div className="glass-card p-6 hover-lift h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold mb-2">{value}</p>
                    {change && (
                        <div className="flex items-center space-x-1">
                            <span className={cn(
                                'text-sm font-medium',
                                trend === 'up' ? 'text-green-500' : 'text-red-500'
                            )}>
                                {trend === 'up' ? '↑' : '↓'} {change}
                            </span>
                            <span className="text-xs text-gray-500">growth</span>
                        </div>
                    )}
                </div>
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center bg-linear-to-br', colorClasses[color])}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
            </div>
        </div>
    );
}