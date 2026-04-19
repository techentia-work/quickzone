"use client";
import React from "react";
import { useModal } from "@/hooks";
import {
  LoginModal,
  RegisterModal,
  ForgotPasswordModal,
  ChangePasswordModal,
} from "@/components";
import dynamic from "next/dynamic";

const LocationModal = dynamic(() => import("../../modal/location/LocationModal"), {
  ssr: false,
});

export const GlobalModalContext = React.createContext<any>(null);

export function GlobalModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const loginModal = useModal();
  const registerModal = useModal();
  const forgotPasswordModal = useModal();
  const changePasswordModal = useModal();
  const locationModal = useModal();

  const modals = {
    loginModal,
    registerModal,
    forgotPasswordModal,
    changePasswordModal,
    locationModal,
  };

  return (
    <GlobalModalContext.Provider value={modals}>
      {children}

      <LoginModal
        isOpen={loginModal.isOpen}
        closeModal={loginModal.closeModal}
        openRegisterModal={registerModal.openModal}
        openForgotPasswordModal={forgotPasswordModal.openModal}
      />

      <RegisterModal
        isOpen={registerModal.isOpen}
        closeModal={registerModal.closeModal}
        openLoginModal={loginModal.openModal}
      />

      <ForgotPasswordModal
        isOpen={forgotPasswordModal.isOpen}
        closeModal={forgotPasswordModal.closeModal}
        openLoginModal={loginModal.openModal}
      />

      <ChangePasswordModal
        isOpen={changePasswordModal.isOpen}
        closeModal={changePasswordModal.closeModal}
      />

      <LocationModal
        isOpen={locationModal.isOpen}
        Step="list"
        onClose={locationModal.closeModal}
      />
    </GlobalModalContext.Provider>
  );
}
