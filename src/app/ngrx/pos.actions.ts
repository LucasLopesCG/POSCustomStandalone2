import { createAction, props } from '@ngrx/store';
import { User } from '../models/user';

export const increment = createAction('[Counter Component] Increment');
export const decrement = createAction('[Counter Component] Decrement');
export const reset = createAction('[Counter Component] Reset');
export const getUser = createAction('[USER] User Login Attempt', (user:User)=>({
    user,
}));
export const setUser = createAction('[USER] User Login Attempt', (user:User)=>({
    user,
}));