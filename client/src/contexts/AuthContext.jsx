import React, { createContext, useReducer, useEffect, useState } from "react";
import { AuthReducer } from "../reducers/AuthReducer";
import { url, LOCAL_STORAGE_TOKEN_NAME, SET_AUTH, FIND_PROFILE, UPDATE_PROFILE } from "./constants";
import setAuthToken from "../utilities/setAuthToken";
import axios from "axios";

export const AuthContext = createContext();

function AuthContextProvider({ children }) {
  const [authState, dispatch] = useReducer(AuthReducer, {
    authLoading: true,
    isAuthenticated: false,
    user: null,
  });

  //Layout State
  const [updateModal, setUpdateModal] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    type: null,
    message: "",
  });

  //Authentication user
  const loadUser = async () => {
    if (localStorage[LOCAL_STORAGE_TOKEN_NAME]) {
      setAuthToken(localStorage[LOCAL_STORAGE_TOKEN_NAME]);
    }
    try {
      const response = await axios.get(`${url}/auth`);
      if (response.data.success) {
        dispatch({
          type: SET_AUTH,
          payload: {
            isAuthenticated: true,
            user: response.data.user,
          },
        });
      }
    } catch (error) {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_NAME);
      setAuthToken(null);
      dispatch({
        type: SET_AUTH,
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  };
  useEffect(() => loadUser(), []);

  // Login
  const loginUser = async (userForm) => {
    try {
      const response = await axios.post(`${url}/auth/login`, userForm);
      if (response.data.success) {
        localStorage.setItem(
          LOCAL_STORAGE_TOKEN_NAME,
          response.data.accessToken
        );
        await loadUser();
        return response.data;
      }
    } catch (error) {
      if (error.response.data) return error.response.data;
      else return { success: false, message: error.message };
    }
  };

  // Register
  const registerUser = async (userForm) => {
    try {
      const response = await axios.post(`${url}/auth/register`, userForm);
      if (response.data.success) {
        localStorage.setItem(
          LOCAL_STORAGE_TOKEN_NAME,
          response.data.accessToken
        );
        await loadUser();
        return response.data;
      }
    } catch (error) {
      if (error.response.data) return error.response.data;
      else return { success: false, message: error.message };
    }
  };

  // Logout
  const logoutUser = () => {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_NAME);
    dispatch({
      type: SET_AUTH,
      payload: {
        isAuthenticated: false,
        user: null,
      },
    });
  };

  //Find Profile
  const findProfile = (userId) => {
    const profile = authState.user.find(
      (user) => user._id === userId
    );
    dispatch({
      type: FIND_PROFILE,
      payload: profile,
    });
  };

  //Update Profile
  const updateProfile = async (updatedUser) => {
    try {
      const response = await axios.put(
        `${url}/profile/${updatedUser._id}`,
        updatedUser
      );
      console.log(response);
      if (response.data.success) {
        dispatch({
          type: UPDATE_PROFILE,
          payload: response.data.profile,
        });
        return response.data;
      }
    } catch (error) {
      return { success: false, message: "Internal server error" };
    }
  };

  // Context data
  const AuthContextData = {
    authState,
    loginUser,
    registerUser,
    logoutUser,
    findProfile,
    updateProfile,
    updateModal,
    setUpdateModal,
    toast,
    setToast,
  };

  return (
    <AuthContext.Provider value={AuthContextData}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;
