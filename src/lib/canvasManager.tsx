import {RectangleCreationManager} from "./rectangleCreationManager";
import {RectangleBoundaryValidator} from "./rectangleBoundaryValidator";
import {setCreationManagersForHook} from "../hooks/useGridData";
import {PublicFunctionManager} from "./publicFunctionManager";

export class CanvasManager {

	private readonly rectangles: GridRectangle[];
	private readonly lineProperties: ReactGridDrawLineRequiredProperties;
	private canvas: any;
	private ctx: any;
	private rectangleCreationManager: RectangleCreationManager;
	private rectangleBoundaryValidator: RectangleBoundaryValidator;
	private currentRect: GridRectangle;
	private containerID: string | null = null;
	private drag: boolean = false;
	private body: HTMLElement | null = null;

	constructor(lineProperties: ReactGridDrawLineRequiredProperties) {
		this.rectangles = [];
		this.currentRect = {startX: 0, startY: 0, width: 0, height: 0, horizontalPointsSelected: [], verticalPointsSelected: [], undoLineList: []};
		this.rectangleCreationManager = new RectangleCreationManager(this.canvas, this.ctx, this.currentRect, lineProperties);
		this.rectangleBoundaryValidator = new RectangleBoundaryValidator(this.canvas,  lineProperties, this.rectangleCreationManager);
		this.lineProperties = lineProperties;
	}

	createCanvas = (containerID: string) => {
		this.containerID = containerID;
		this.body = document.getElementById(this.containerID);
		this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		this.canvas.addEventListener('mousedown', this.mouseDown, false);
		this.canvas.addEventListener('mouseup', this.mouseUp, false);
		this.canvas.addEventListener('mousemove', this.mouseMove, false);
		this.setCanvasSize();

		this.rectangleCreationManager = new RectangleCreationManager(this.canvas, this.ctx, this.currentRect, this.lineProperties);
		this.rectangleBoundaryValidator = new RectangleBoundaryValidator(this.canvas, this.lineProperties, this.rectangleCreationManager);
		setCreationManagersForHook(new PublicFunctionManager(this.canvas, this.rectangles, this.containerID, this.rectangleCreationManager));
	}

	setCanvasSize = () => {
		if (this.body != null) {
			this.canvas.width = this.body.offsetWidth;
			this.canvas.height = this.body.offsetHeight;
		}
	}

	mouseDown = (e: MouseEvent) => {
		let mouseX = e.offsetX;
		let mouseY = e.offsetY;
		let rectangleWithMouseOnBorder: GridRectangle | undefined = this.rectangleBoundaryValidator.getRectForMouseOnBorder(mouseX, mouseY, this.rectangles);
		if (rectangleWithMouseOnBorder != undefined) {
			this.rectangleCreationManager.drawLineAtClickedGridBoundaryPosition(e, rectangleWithMouseOnBorder);
		} else if (!this.rectangleBoundaryValidator.isMouseClickInsideBoxRegion(mouseX, mouseY, this.rectangles)) {
			this.rectangleCreationManager.resetBoxProperties(this.currentRect, mouseX, mouseY);
			this.drag = true;
		}
	}

	mouseUp = (e: MouseEvent) => {
		if (this.drag) {
			this.rectangles.push(this.currentRect);
		}
		this.drag = false;
		this.currentRect = {startX: 0, startY: 0, width: 0, height: 0, verticalPointsSelected: [], horizontalPointsSelected: [], undoLineList: []}
		this.drawAllCreatedRectangles(e);
	}

	mouseMove = (e: MouseEvent) => {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if (this.drag && this.body != null) {
			this.rectangleCreationManager.drawRectangle(this.currentRect, e.pageX, e.pageY);
		} else if (!this.drag) {
			let mouseX = e.pageX - this.canvas.offsetLeft;
			let mouseY = e.pageY - this.canvas.offsetTop;
			this.rectangleBoundaryValidator.showMouseCursorAsPointer(e, 'auto');
			this.rectangleBoundaryValidator.CheckForMouseOnBoxBoundaryOfRectAndReDraw(this.currentRect, mouseX, mouseY, e);
		}
		this.drawAllCreatedRectangles(e);
	}

	private drawAllCreatedRectangles = (e: MouseEvent) => {
		let mouseX = e.pageX - this.canvas.offsetLeft;
		let mouseY = e.pageY - this.canvas.offsetTop;
		this.buildRectanglesWithMouseChecks(mouseX, mouseY, e);
	}

	private buildRectanglesWithMouseChecks(mouseX: number, mouseY: number, e: MouseEvent) {
		this.rectangles.forEach((rect: GridRectangle) => {
			this.rectangleBoundaryValidator.CheckForMouseOnBoxBoundaryOfRectAndReDraw(rect, mouseX, mouseY, e);
			this.rectangleCreationManager.drawRectGridLines(rect);
		});
	}
}