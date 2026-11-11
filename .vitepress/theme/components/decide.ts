/** The shape Decide draws: a question whose answers lead on, or end. */
export interface Answer {
    label: string;
    /** another question */
    next?: Question;
    /** or an outcome */
    result?: string;
    /** a page or section that explains the outcome: '/guide/backups#restore' */
    link?: string;
    /** brand: what you hope for; danger: something to fix or that is lost */
    tone?: 'brand' | 'danger' | 'muted';
}
export interface Question {
    question: string;
    answers: Answer[];
}
