import planner from './planner';

export default (app) => {
    app.get('/ms/plans', planner);
}