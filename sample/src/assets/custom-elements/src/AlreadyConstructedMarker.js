/**
 * This class exists only to work around Closure's lack of a way to describe
 * singletons. It represents the 'already constructed marker' used in custom
 * element construction stacks.
 *
 * https://html.spec.whatwg.org/#concept-already-constructed-marker
 * @extends AlreadyConstructedMarkerType
 */
class AlreadyConstructedMarker {}

export default new AlreadyConstructedMarker();
