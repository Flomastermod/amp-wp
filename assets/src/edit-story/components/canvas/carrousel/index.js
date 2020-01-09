/**
 * External dependencies
 */
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import { useStory } from '../../../app';
import DropZone from '../../../components/dropzone';

const List = styled.nav`
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	justify-content: center;
	height: 100%;
	padding-top: 1em;
`;

const Page = styled.a`
	background-color: ${ ( { isActive, theme } ) => isActive ? theme.colors.fg.v1 : theme.colors.mg.v1 };
	height: 48px;
	width: 27px;
	margin: 0 5px;
	cursor: pointer;

	&:hover {
		background-color: ${ ( { theme } ) => theme.colors.fg.v1 };
	}
`;

function Canvas() {
	const { state: { pages, currentPageIndex }, actions: { setCurrentPageByIndex, arrangePage } } = useStory();
	const getArrangeIndex = ( sourceIndex, dstIndex, position ) => {
		// If the dropped element is before the dropzone index then we have to deduct
		// that from the index to make up for the "lost" element in the row.
		const indexSubstraction = sourceIndex < dstIndex ? -1 : 0;
		if ( 'left' === position.x ) {
			return dstIndex + indexSubstraction;
		}
		return dstIndex + 1 + indexSubstraction;
	};
	return (
		<List>
			{ pages.map( ( page, index ) => {
				const onDrop = ( evt, position ) => {
					const droppedEl = JSON.parse( evt.dataTransfer.getData( 'text' ) );
					if ( ! droppedEl || 'page' !== droppedEl.type ) {
						return;
					}
					const arrangedIndex = getArrangeIndex( droppedEl.index, index, position );
					// Do nothing if the index didn't change.
					if ( droppedEl.index !== arrangedIndex ) {
						arrangePage( droppedEl.index, arrangedIndex );
						setCurrentPageByIndex( arrangedIndex );
					}
				};
				// @todo Create a Draggable component for setting data and setting "draggable".
				const onDragStart = ( evt ) => {
					const pageData = {
						type: 'page',
						index,
					};
					evt.dataTransfer.setData( 'text', JSON.stringify( pageData ) );
				};
				return (
					<DropZone key={ index } onDrop={ onDrop } >
						<Page draggable="true" onDragStart={ onDragStart } onClick={ () => setCurrentPageByIndex( index ) } isActive={ index === currentPageIndex } />
					</DropZone>
				);
			} ) }
		</List>
	);
}

export default Canvas;
