export interface Exercise {
    name: string;
    sets: string;
    reps: string;
    weight?: string;
    notes?: string
};

export interface RoutineContent {
    title: string;
    description?: string;
    days: {
        [dayName: string]: Exercise[]
    };
    metadata?: {
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        durationMinutes: number;
    }
}

export interface Routine {
    id: string
    profile_id: string
    routine_name: string
    routine_content: RoutineContent;
    is_active: boolean;
};