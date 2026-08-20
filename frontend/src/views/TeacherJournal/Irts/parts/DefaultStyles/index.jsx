import DejaVuNormal from '@assets/fonts/pdf_font/DejaVuSans.ttf';
import DejaVuBold from '@assets/fonts/pdf_font/DejaVuSans-Bold.ttf';
import { width } from '../../constants';


const value1 = 53
const value2 = 1
const value3 = 4

/**
 * to avoid random style overriding on style conflicts with other components' styles without page refresh:
 * - because it is being removed on dismount so it does not affect to other components.
 * - because imported styles' priority is random. But this way is not random, so no need to use !important.
 * - because in window.open() html print works more stable then in react window (for example all print options are not overrided).
  * - to be able to scale values dynamically.
  * but it does not include bootstrap styles so need to transfer custom styles as string.
  * all "digital" values are defined there, other values can be defined partially
 * @returns style html element
 */
export default function DefaultStyles({ scale = 1 }) {
	return (
		<style>
			{`
				@font-face {
					font-family: 'DejaVuSans';
					src: url(${DejaVuNormal}) format('truetype');
					font-weight: normal;
					font-style: normal;
				}

				@font-face {
					font-family: 'DejaVuSans';
					src: url(${DejaVuBold}) format('truetype');
					font-weight: 600;
					font-style: normal;
				}

				td, th {
					padding: ${2 * scale}px ${4 * scale}px;
				}

				.font1 {
					font-family: 'DejaVuSans', sans-serif;
				}

				.book {
					color: #214F81;
					background: #ffffff;
					padding: ${value1 * scale}px;
					border: ${1 * scale}px solid #cccccc;
				}

				.border1 td, .border1 th {
					border: ${value2 * scale}px solid #214F81;
				}

				[dir] .border2 {
					border-bottom: ${1 * scale}px dotted #000000;
				}

				[dir] .textAlign1,
				.textAlign1 {
					text-align: start;
				}

				.textAlign2 {
					text-align: center;
				}

				.textAlign3 {
					text-align: end;
				}

				.width1 {
					width: ${40 * scale}px;
				}

				.width2 {
					width: ${80 * scale}px;
				}

				.width3 {
					width: ${120 * scale}px;
				}

				.width4 {
					width: ${400 * scale}px;
				}

				.width5 {
					width: ${(width - value1 * 2 - value2 * 2 - value3 * 2) * scale}px;
				}

				.minWidth3 {
					min-width: ${120 * scale}px;
				}

				.fontSize1 {
					font-size: ${11 * scale}px;
				}

				.fontSize2 {
					font-size: ${16 * scale}px;
				}

				.fontSize3 {
					font-size: ${30 * scale}px;
				}

				.fontWeight1 {
					font-weight: 600;
				}

				.fontWeight2, th {
					font-weight: normal;
				}

				.margin1 {
					margin: ${53 * scale}px;
				}

				.margin2 {
					margin-bottom: ${40 * scale}px;
				}

				.padding1 {
					padding-bottom: ${27 * scale}px;
				}

				.padding2 {
					padding-top: ${40 * scale}px;
				}

				.padding3 {
					padding-bottom: ${53 * scale}px;
				}

				.padding4 {
					padding-bottom: ${5 * scale}px;
				}

				.padding5 {
					padding: ${value3 * scale}px ${2 * scale}px;
				}

				.verticalAlign1 {
					vertical-align: top;
				}

				.height1 {
					height: ${80 * scale}px;
				}
			`}
		</style>
	)
}