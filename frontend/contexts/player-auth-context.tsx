"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { PlayerUser } from "@/schemas/player.schema";

interface PlayerAuthContextType {
    player: PlayerUser | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    setAuth: (token: string, player: PlayerUser) => void;
    clearAuth: () => void;
    updatePlayer: (player: PlayerUser) => void;
}

const PlayerAuthContext = createContext<PlayerAuthContextType | undefined>(undefined);

export function PlayerAuthProvider({ children }: { children: ReactNode }) {
    const [player, setPlayer] = useState<PlayerUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("player_auth_token");
        const storedPlayer = localStorage.getItem("player_auth_user");

        if (storedToken && storedPlayer) {
            try {
                setToken(storedToken);
                setPlayer(JSON.parse(storedPlayer) as PlayerUser);
            } catch (_error) {
                localStorage.removeItem("player_auth_token");
                localStorage.removeItem("player_auth_user");
            }
        }

        setLoading(false);
    }, []);

    const setAuth = (nextToken: string, nextPlayer: PlayerUser) => {
        localStorage.setItem("player_auth_token", nextToken);
        localStorage.setItem("player_auth_user", JSON.stringify(nextPlayer));
        setToken(nextToken);
        setPlayer(nextPlayer);
    };

    const clearAuth = () => {
        localStorage.removeItem("player_auth_token");
        localStorage.removeItem("player_auth_user");
        setToken(null);
        setPlayer(null);
    };

    const updatePlayer = (nextPlayer: PlayerUser) => {
        localStorage.setItem("player_auth_user", JSON.stringify(nextPlayer));
        setPlayer(nextPlayer);
    };

    return (
        <PlayerAuthContext.Provider
            value={{
                player,
                token,
                isAuthenticated: !!token,
                loading,
                setAuth,
                clearAuth,
                updatePlayer,
            }}
        >
            {children}
        </PlayerAuthContext.Provider>
    );
}

export function usePlayerAuthContext() {
    const context = useContext(PlayerAuthContext);
    if (!context) {
        throw new Error("usePlayerAuthContext must be used within a PlayerAuthProvider");
    }

    return context;
}
