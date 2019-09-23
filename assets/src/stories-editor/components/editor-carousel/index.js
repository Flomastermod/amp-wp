/**
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Indicator from './indicator';
import { Reorderer } from '../';
import { STORY_PAGE_INNER_WIDTH } from '../../constants';
import './edit.css';

// This is the sum of left (20px) and right (30px) margin.
const TOTAL_PAGE_MARGIN = 50;
const PAGE_BORDER = 1;

const EditorCarousel = () => {
	const { pages, currentPage, currentIndex, previousPage, nextPage, isReordering } = useSelect( ( select ) => {
		const {
			getBlockOrder,
			getBlocksByClientId,
			getAdjacentBlockClientId,
		} = select( 'core/block-editor' );
		const { getCurrentPage, isReordering: _isReordering } = select( 'amp/story' );

		const _currentPage = getCurrentPage();
		const _pages = getBlocksByClientId( getBlockOrder() );

		const index = pages.findIndex( ( { clientId } ) => clientId === currentPage );

		return {
			pages: _pages,
			currentPage: _currentPage,
			currentIndex: Math.max( 0, index ), // Prevent -1 from being used for calculation.
			previousPage: getCurrentPage() ? getAdjacentBlockClientId( _currentPage, -1 ) : null,
			nextPage: getCurrentPage() ? getAdjacentBlockClientId( _currentPage, 1 ) : null,
			isReordering: _isReordering(),
		};
	}, [] );

	useEffect( () => {
		const wrapper = document.querySelector( '#amp-story-controls + .block-editor-block-list__layout' );

		if ( ! wrapper ) {
			return;
		}

		if ( isReordering ) {
			wrapper.style.display = 'none';
		} else {
			wrapper.style.display = '';
			wrapper.style.transform = `translateX(calc(50% - ${ PAGE_BORDER }px - ${ ( STORY_PAGE_INNER_WIDTH + TOTAL_PAGE_MARGIN ) / 2 }px - ${ ( currentIndex ) * TOTAL_PAGE_MARGIN }px - ${ currentIndex * STORY_PAGE_INNER_WIDTH }px))`;
		}
	}, [ currentIndex, isReordering ] );

	const { setCurrentPage } = useDispatch( 'amp/story' );
	const { selectBlock } = useDispatch( 'core/block-editor' );

	const goToPage = ( page ) => {
		setCurrentPage( page );
		selectBlock( page );
	};

	if ( isReordering ) {
		return <Reorderer />;
	}

	return (
		<>
			<div className="amp-story-editor-carousel-navigation">
				<IconButton
					icon="arrow-left-alt2"
					label={ __( 'Previous Page', 'amp' ) }
					onClick={ ( e ) => {
						e.preventDefault();
						goToPage( previousPage );
					} }
					disabled={ null === previousPage }
				/>
				<Indicator
					pages={ pages }
					currentPage={ currentPage }
					onClick={ goToPage }
				/>
				<IconButton
					icon="arrow-right-alt2"
					label={ __( 'Next Page', 'amp' ) }
					onClick={ ( e ) => {
						e.preventDefault();
						goToPage( nextPage );
					} }
					disabled={ null === nextPage }
				/>
			</div>
		</>
	);
};

EditorCarousel.propTypes = {
	pages: PropTypes.arrayOf( PropTypes.shape( {
		clientId: PropTypes.string,
	} ) ),
	currentIndex: PropTypes.number.isRequired,
	currentPage: PropTypes.string,
	previousPage: PropTypes.string,
	nextPage: PropTypes.string,
	onChangePage: PropTypes.func.isRequired,
	isReordering: PropTypes.bool,
};

export default EditorCarousel;
