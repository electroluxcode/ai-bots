import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../pages/Home";
import { FlowPage } from "../pages/FlowPage";


export const Route = createFileRoute("/")({
	component: FlowPage,
}); 