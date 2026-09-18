import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";


export default function CustomModal({
	clicked,
	setClicked,
	header,
	children
}) {
	// #region hooks
	const [open, setOpen] = useState(false);

	useEffect(() => {
		handleClick()
	}, [clicked])
	// #endregion hooks

	function closeModal() {
		setOpen(false)
		setClicked(null)
	}

	const handleClick = () => {
		if (!clicked) {
			closeModal()
			return
		}

		setOpen(true);
	};

	return (
		<>

			<Modal
				isOpen={open}
				backdrop="static"
				centered
			>
				<ModalHeader
					toggle={closeModal}
				>
					{header}
				</ModalHeader>
				<ModalBody style={{ textAlign: 'center', overflow: 'auto' }}>
					{children}
				</ModalBody>
			</Modal>
		</>
	)
}