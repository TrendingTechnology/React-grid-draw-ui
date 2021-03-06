import React, {
	CSSProperties,
	Fragment,
	FunctionComponent,
	PropsWithChildren,
	ReactElement,
	ReactNode,
	useEffect,
	useState
} from "react";
import {useGridData} from "./hooks/useGridData";
import {CanvasManager} from "./lib/canvasManager";

const canvasWrapStyle: CSSProperties = {
	display: "flex",
}

const canvasStyle: CSSProperties = {
	zIndex: 10000,
	width: "inherit",
	position: "absolute"
}

const ReactGridDrawUI: FunctionComponent<ReactGridDrawLineOptionalProperties> = (props: PropsWithChildren<ReactGridDrawLineOptionalProperties>): ReactElement => {

	const [canvasManger, setCanvasManager] = useState<CanvasManager>(new CanvasManager({
		lineClickTolerance: props.lineClickTolerance as number,
		selectCircleSize: props.selectCircleSize as number,
		circleLineShiftSize: props.circleLineShiftSize as number,
		contextLineWidth: props.contextLineWidth as number,
		lineColour: props.lineColour as string
	}));

	useEffect(() => {
		let containerID: string = getContainerID();
		canvasManger.createCanvas(containerID);
	}, []);

	const getContainerID = () => {
		let children = props.children as React.ReactNodeArray;
		if (children.length > 1) {
			throw "children of element <ReactGridDrawUI> greater than 1";
		}
		let drawingContainer = children as ReactNode as {props: {id: string}};
		let containerID = drawingContainer.props.id;
		if (containerID == null) {
			throw "child of element <ReactGridDrawUI> has no ID";
		}
		return containerID;
	}

	return (
		<Fragment>
			<div id="canvas-wrap" style={canvasWrapStyle}>
				{props.children}
				<canvas id="canvas" style={canvasStyle}/>
			</div>
		</Fragment>
	);
};

ReactGridDrawUI.defaultProps = {
	lineClickTolerance: 15,
	selectCircleSize: 3,
	circleLineShiftSize: 10,
	contextLineWidth: 1,
	lineColour: "red"
}

export {
	ReactGridDrawUI,
	useGridData
}