import { useLocation } from "@tanstack/react-router";

export default function useDirectory() {
    const location = useLocation();
    return location.href.split('/')[1]?.toUpperCase() ?? 'LEARNER';
}