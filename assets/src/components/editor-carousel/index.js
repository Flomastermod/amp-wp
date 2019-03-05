/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { Fragment, Component } from '@wordpress/element';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import Indicator from './indicator';

const PAGE_MARGIN = 20;
const PAGE_WIDTH = 338;

class EditorCarousel extends Component {
	constructor( props ) {
		super( props );

		this.translateWrapper.bind( this );
	}

	translateWrapper() {
		const wrapper = document.querySelector( '.editor-writing-flow .editor-block-list__layout' );
		wrapper.style.transform = `translateX(calc(50% - ${ PAGE_WIDTH / 2 }px - ${ ( this.props.currentIndex ) * PAGE_MARGIN }px - ${ this.props.currentIndex * PAGE_WIDTH }px))`;
	}

	componentDidMount() {
		this.translateWrapper();
	}

	componentDidUpdate() {
		this.translateWrapper();
	}

	render() {
		const { pages, currentPage, previousPage, nextPage, onChangePage } = this.props;

		const goToPage = ( page ) => {
			onChangePage( page );
		};

		return (
			<Fragment>
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
			</Fragment>
		);
	}
}

export default compose(
	withSelect( ( select ) => {
		const {
			getBlockOrder,
			getBlocksByClientId,
			getAdjacentBlockClientId,
		} = select( 'core/editor' );
		const { getCurrentPage } = select( 'amp/story' );

		const currentPage = getCurrentPage();
		const pages = getBlocksByClientId( getBlockOrder() );

		return {
			pages,
			currentPage,
			currentIndex: pages.findIndex( ( { clientId } ) => clientId === currentPage ),
			previousPage: getCurrentPage() ? getAdjacentBlockClientId( currentPage, -1 ) : null,
			nextPage: getCurrentPage() ? getAdjacentBlockClientId( currentPage, 1 ) : null,
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { setCurrentPage } = dispatch( 'amp/story' );

		return {
			onChangePage: ( pageClientId ) => {
				setCurrentPage( pageClientId );
			},
		};
	} )
)( EditorCarousel );
