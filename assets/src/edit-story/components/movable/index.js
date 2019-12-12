/**
 * External dependencies
 */
import Moveable from 'react-moveable';
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { useRef, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useStory } from '../../app';

const CORNER_HANDLES = [ 'nw', 'ne', 'sw', 'se' ];
const ALL_HANDLES = [ 'n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se' ];

function Movable( {
	selectedEl,
	targetEl,
	targets: targetList,
	pushEvent,
} ) {
	const moveable = useRef();

	const {
		state: { selectedElements },
		actions: { setPropertiesOnSelectedElements, updateElementsByIds },
	} = useStory();

	useEffect( () => {
		if ( moveable.current ) {
			// If we have persistent event then let's use that, ensuring the targets match.
			if ( pushEvent && pushEvent.target === targetEl ) {
				moveable.current.moveable.dragStart( pushEvent );
			}
			moveable.current.updateRect();
		}
		// Disable reason: we should not run this when pushEvent changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ targetEl, moveable ] );

	useEffect( () => {
		if ( moveable.current ) {
			moveable.current.updateRect();
		}
	}, [ selectedElements ] );

	const setStyle = ( target ) => {
		target.style.transform = `translate(${ frame.translate[ 0 ] }px, ${ frame.translate[ 1 ] }px) rotate(${ frame.rotate }deg)`;
	};

	// @todo Is there any time when translate would differ among the elements? If not, we can use just one translate for these.
	const frames = targetList ? targetList.map( ( e, i ) => ( {
		translate: [ 0, 0 ],
		rotate: selectedElements[ i ].rotationAngle,
	} ) ) : [];

	/**
	 * Resets Movable once the action is done, sets the initial values.
	 *
	 * @param {Object} target Target element.
	 */
	const resetMoveable = ( target ) => {
		// @todo Improve this logic.
		if ( targetList && targetList.length ) {
			targetList.forEach( ( el, i ) => {
				frames[ i ].translate = [ 0, 0 ];
				el.style.transform = `translate(0px, 0px) rotate(${ frames[ i ].rotate }deg)`;
			} );
		} else {
			frame.translate = [ 0, 0 ];
			setStyle( target );
		}
		if ( moveable.current ) {
			moveable.current.updateRect();
		}
	};

	if ( targetList && targetList.length ) {
		return (
			<Moveable
				ref={ moveable }
				target={ targetList }
				draggable={ true }
				resizable={ false }
				rotatable={ true }
				onDragGroup={ ( { events } ) => {
					events.forEach( ( { target, beforeTranslate }, i ) => {
						const sFrame = frames[ i ];
						sFrame.translate = beforeTranslate;
						target.style.transform = `translate(${ beforeTranslate[ 0 ] }px, ${ beforeTranslate[ 1 ] }px)`;
					} );
				} }
				onDragGroupStart={ ( { events } ) => {
					events.forEach( ( ev, i ) => {
						const sFrame = frames[ i ];
						ev.set( sFrame.translate );
					} );
				} }
				onDragGroupEnd={ ( { targets } ) => {
					const updatedElements = [];
					// Set together updated elements.
					targets.forEach( ( target, i ) => {
						// @todo Improve this here.
						updatedElements.push( { id: selectedElements[ i ].id, x: selectedElements[ i ].x + frames[ i ].translate[ 0 ], y: selectedElements[ i ].y + frames[ i ].translate[ 1 ] } );
					} );
					if ( updatedElements.length ) {
						// Update the elements.
						updateElementsByIds( updatedElements );
					}
					resetMoveable( null );
				} }
				onRotateGroupStart={ ( { events } ) => {
					events.forEach( ( ev, i ) => {
						const sFrame = frames[ i ];
						ev.set( sFrame.rotate );
					} );
				} }
				onRotateGroup={ ( { events } ) => {
					events.forEach( ( { target, beforeRotate, drag }, i ) => {
						const sFrame = frames[ i ];
						sFrame.rotate = beforeRotate;
						sFrame.translate = drag.beforeTranslate;
						target.style.transform = `translate(${ drag.beforeTranslate[ 0 ] }px, ${ drag.beforeTranslate[ 1 ] }px) rotate(${ beforeRotate }deg)`;
					} );
				} }
				onRotateGroupEnd={ ( { targets } ) => {
					const updatedElements = [];
					// Set together updated elements.
					targets.forEach( ( target, i ) => {
						// @todo Improve this here.
						updatedElements.push( {
							id: selectedElements[ i ].id,
							x: selectedElements[ i ].x + frames[ i ].translate[ 0 ],
							y: selectedElements[ i ].y + frames[ i ].translate[ 1 ],
							rotationAngle: frames[ i ].rotate,
						} );
					} );
					if ( updatedElements.length ) {
						// Update the elements.
						updateElementsByIds( updatedElements );
					}
					resetMoveable( null );
				} }
				origin={ false }
			/>
		);
	}

	const frame = {
		translate: [ 0, 0 ],
		rotate: selectedEl.rotationAngle,
	};

	return (
		<Moveable
			ref={ moveable }
			target={ targetEl }
			draggable={ true }
			resizable={ true }
			rotatable={ true }
			onDrag={ ( { target, beforeTranslate } ) => {
				frame.translate = beforeTranslate;
				setStyle( target );
			} }
			throttleDrag={ 0 }
			onDragStart={ ( { set } ) => {
				set( frame.translate );
			} }
			onDragEnd={ ( { target } ) => {
				// When dragging finishes, set the new properties based on the original + what moved meanwhile.
				const newProps = { x: selectedEl.x + frame.translate[ 0 ], y: selectedEl.y + frame.translate[ 1 ] };
				setPropertiesOnSelectedElements( newProps );
				resetMoveable( target );
			} }
			onResizeStart={ ( { setOrigin, dragStart } ) => {
				setOrigin( [ '%', '%' ] );
				if ( dragStart ) {
					dragStart.set( frame.translate );
				}
			} }
			onResize={ ( { target, width, height, drag } ) => {
				target.style.width = `${ width }px`;
				target.style.height = `${ height }px`;
				frame.translate = drag.beforeTranslate;
				setStyle( target );
			} }
			onResizeEnd={ ( { target } ) => {
				setPropertiesOnSelectedElements( {
					width: parseInt( target.style.width ),
					height: parseInt( target.style.height ),
					x: selectedEl.x + frame.translate[ 0 ],
					y: selectedEl.y + frame.translate[ 1 ],
				} );
				resetMoveable( target );
			} }
			onRotateStart={ ( { set } ) => {
				set( frame.rotate );
			} }
			onRotate={ ( { target, beforeRotate } ) => {
				frame.rotate = beforeRotate;
				setStyle( target );
			} }
			onRotateEnd={ ( { target } ) => {
				setPropertiesOnSelectedElements( { rotationAngle: frame.rotate } );
				resetMoveable( target );
			} }
			origin={ false }
			pinchable={ true }
			keepRatio={ 'image' === selectedEl.type } // @†odo Even image doesn't always keep ratio, consider moving to element's model.
			renderDirections={ 'image' === selectedEl.type ? CORNER_HANDLES : ALL_HANDLES }
		/>
	);
}

Movable.propTypes = {
	selectedEl: PropTypes.object,
	targetEl: PropTypes.object,
	targets: PropTypes.array,
	pushEvent: PropTypes.object,
};

export default Movable;
