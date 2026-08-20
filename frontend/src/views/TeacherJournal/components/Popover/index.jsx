import React, { useState, useEffect } from "react";
import { Popover, PopoverBody } from "reactstrap";


export default function PopoverToId({ children = <></>, clickedId, setClickedId }) {
	const [popoverOpen, setPopoverOpen] = useState(false);

	let toRender = clickedId && <Popover
		key={popoverOpen}
		isOpen={popoverOpen}
		target={clickedId}
		toggle={() => setPopoverOpen(false)}
		placement="auto"
		modifiers={[
			{
				name: "preventOverflow",
				options: {
					boundary: "viewport"
				}
			},
			{
				name: "flip",
				options: {
					fallbackPlacements: ["top", "bottom", "left", "right"]
				}
			}
		]}
	>
		<PopoverBody className="d-flex gap-2">
			{children}
		</PopoverBody>
	</Popover>

	const handleCellClick = () => {
		if (!clickedId) {
			setPopoverOpen(false)
			setClickedId(null)
			return
		}

		setPopoverOpen(true);
	};

	useEffect(() => {
		handleCellClick()
	}, [clickedId])

	const handleClickOutside = (e) => {
		if (!clickedId) return
		const popoverEl = document.querySelector(".popover");
		const targetEl = document.getElementById(clickedId);

		if (
			popoverEl &&
			!popoverEl.contains(e.target) &&
			targetEl &&
			!targetEl.contains(e.target)
		) {
			setPopoverOpen(false);
			setClickedId(null)
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [clickedId]);

	return toRender
}
