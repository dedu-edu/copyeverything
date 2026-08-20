export const quillOpts = {
	modules: {
		toolbar: [
			['bold', 'italic', 'underline', 'strike'],
			[{ align: [] }],

			[{ list: 'ordered' }, { list: 'bullet' }],
			[{ indent: '-1' }, { indent: '+1' }],

			[{ size: ['small', false, 'large', 'huge'] }],
			['link', 'image',],

			[{ color: [] }, { background: [] }],

			['clean'],
		],
	},
	formats: [
		'header', 'bold', 'italic', 'underline', 'strike',
		'align', 'list', 'indent',
		'size',
		'link', 'image',
		'color', 'background',
		'clean',
	],
}


export const handleQuillImage = (quill, handleNewQuillImages, quillImagesRef) => {
	const quillImages = quillImagesRef.current || {}
	const input = document.createElement("input");
	input.type = "file";
	input.accept = "image/*";
	input.click();

	input.onchange = () => {
		const file = input.files[0];
		if (!file) return;

		// to show image inside editor
		const blobUrl = URL.createObjectURL(file);
		const range = quill.getSelection();
		quill.insertEmbed(range.index, "image", blobUrl);
		quill.setSelection(range.index + 1);

		// to get still remained in editor values
		const imgsAfter = quill.root.querySelectorAll('img');
		const newState = {}
		quillImages[blobUrl] = file
		imgsAfter.forEach(({ src }) => { if (quillImages[src]) newState[src] = quillImages[src] })

		// to set files in state
		handleNewQuillImages(newState)
	};
};
