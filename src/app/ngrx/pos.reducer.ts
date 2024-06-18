import { createFeatureSelector, createReducer, createSelector,on } from "@ngrx/store";
import {getUser,setUser} from './pos.actions'
import { User } from "../models/user";


export const storeReducerFeatureKey = 'storeReducer';
export interface State{
    user:User;
}

export interface UserState{
    userId:number;
    name:string;
}

const initialState:User={id:''};


export const stateReducer=createReducer(
    initialState,
    on(setUser, (state, {user})=> ({...state,user:user}))
)

export const selectState = createFeatureSelector<State>(
    storeReducerFeatureKey,
  );
  export const userSelector = createSelector(
    selectState,
      (state: State) => state?.user?state.user:{}
    );
  
