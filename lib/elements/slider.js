import React,{Component} from 'react';
import PropTypes from 'prop-types';
import styles from './range.css.js';
import ReactDOM from 'react-dom';
export default class Slider extends Component{

    constructor(props){
        super(props);
        this.state={
            value: this.props.settings.start,
            position: 0,
            offset: 10,
            precision: 0,
            mouseDown: false
        }
        this.determinePosition = this.determinePosition.bind(this);
    }
    componentDidMount () {
        this.determinePrecision();
        this.determinePosition(this.state.value);
      }
    determinePrecision() {
        let split = String(this.props.settings.step).split('.');
        let decimalPlaces;
        if(split.length == 2) {
            decimalPlaces = split[1].length;
        } else {
            decimalPlaces = 0;
        }
        this.setState({
            precision:Math.pow(10, decimalPlaces)
        });
    }
    determineValue(startPos, endPos, currentPos){
        let ratio = (currentPos - startPos) / (endPos - startPos);
        let range = this.props.settings.max - this.props.settings.min;
        let difference = Math.round(ratio * range / this.props.settings.step) * this.props.settings.step;
        // Use precision to avoid ugly Javascript floating point rounding issues
        // (like 35 * .01 = 0.35000000000000003)
        difference = Math.round(difference * this.state.precision) / this.state.precision;
        return difference + this.props.settings.min;
    }
    determinePosition(value){
        let ratio = (value - this.props.settings.min) / (this.props.settings.max - this.props.settings.min);
        let trackFillLeft = ReactDOM
        .findDOMNode(this.trackFill)
        .getBoundingClientRect().left;
        let innerLeft = ReactDOM
        .findDOMNode(this.inner)
        .getBoundingClientRect().left;
        let position = Math.round(ratio * this.inner.offsetWidth) + trackFillLeft-innerLeft - this.state.offset;
        if(this.props.vertical){
            position = Math.round(ratio * this.inner.offsetHeight) - this.state.offset;
        }
        this.setState({
            position: position,
        });
    }
    setValue(value,triggeredByUser){
        if(typeof triggeredByUser === 'undefined') {
            triggeredByUser = true;
        }
        if(this.state.value!==value){
            /*if(this.props.settings.input) {
                $(this.props.settings.input).val(value);
            }*/
            if( this.props.settings.onChange) {
                this.props.settings.onChange(value, {triggeredByUser: triggeredByUser});
            }
            this.setState({
                value
            })
        }
    }
    setValuePosition(val, triggeredByUser){
        if(typeof triggeredByUser === 'undefined') {
            triggeredByUser = true;
        }
        if(val<=this.props.settings.max && val>=this.props.settings.min){
            var position = this.determinePosition(val);
            this.setValue(val, triggeredByUser);
        }
    }
    setPosition(val) {
        this.setState({
            position: val
        });
    }
    rangeMouseDown(isTouch,e){
        e.stopPropagation();
        if(!this.state.disabled){
            e.preventDefault();
            this.setState({
                mouseDown:true
            });
            let height;
            let pageY;
            let pageX;
            if (this.props.vertical) {
                let innerBoundingClientRect = ReactDOM
                .findDOMNode(this.inner)
                .getBoundingClientRect();
                this.innerTop = innerBoundingClientRect.top;
                height = this.innerTop + this.inner.offsetHeight;
                pageY;
                e.pageY ? pageY = e.pageY : console.log("PageY undefined");
            }else{
                let innerBoundingClientRect = ReactDOM
                .findDOMNode(this.inner)
                .getBoundingClientRect();
                this.innerLeft = innerBoundingClientRect.left;
                this.innerRight = this.innerLeft + this.inner.offsetWidth;
                pageX;
                e.pageX ? pageX = e.pageX : console.log("PageX undefined");
            }

            let value;
            if(this.props.vertical){
                console.log("pageY",pageY);
                console.log("inner top",this.innerTop);
                console.log("height",height);
                value = this.determineValue(this.innerTop, height, pageY);
            }else{
                console.log("pageX",pageX);
                console.log("inner left",this.innerLeft);
                console.log("inner right",this.innerRight);
                value = this.determineValue(this.innerLeft,this.innerRight,pageX);
            } 
            console.log("value",value);
            if((!this.props.vertical && (pageX >= this.innerLeft && pageX <= this.innerRight))|| (this.props.vertical && (pageY >= this.innerTop && pageY <= height))) {
                console.log("in");
                if(this.props.vertical){
                    this.setPosition(height-pageY-this.state.offset);
                }else{
                    this.setPosition(pageX-this.innerLeft-this.state.offset);
                }
                this.setValue(value);
            }
        }
    }
    rangeMouseMove(isTouch,e){
        e.stopPropagation();
        e.preventDefault();
        if(this.state.mouseDown){
            
            let value;
            let pageY;
            let pageX;
            let height = this.innerTop + this.inner.offsetHeight;
            if(this.props.vertical){
                e.pageY ? pageY = e.pageY : console.log("PageY undefined");
                value = this.determineValue(this.innerTop, height, pageY);
            }else{
                e.pageX ? pageX = e.pageX : console.log("PageX undefined");
                value = this.determineValue(this.innerLeft,this.innerRight,pageX);
            }
            if(pageX >= this.innerLeft && pageX <= this.innerRight) {
                this.setValuePosition(value,false);
            }
            if((!this.props.vertical && (pageX >= this.innerLeft && pageX <= this.innerRight))|| (this.props.vertical && (pageY >= this.innerTop && pageY <= height))) {
                if(value >= this.props.settings.min && value <= this.props.settings.max){
                    if(this.props.vertical){
                        this.setPosition(height-pageY-this.state.offset);
                    }else{
                        this.setPosition(pageX-this.innerLeft-this.state.offset);
                    }
                    this.setValue(value);
                }
                
                
            }
        }
    }

    rangeMouseUp(){
        this.setState({
            mouseDown:false
        })
    }

    componentWillUnmount(){
        this.inner = undefined;
        this.innerLeft = undefined;
        this.innerRight= undefined;
    }
    
    componentWillReceiveProps(nextProps){
        if(nextProps.value!==this.state.value){
            this.setValuePosition(nextProps.value,true);
        }
    }

    componentDidMount(){
        this.verticalOffset = ReactDOM
        .findDOMNode(this.inner)
        .getBoundingClientRect().top;
    }

    render(){
        return(
            <div>
                <div 
                    style={{
                        ...styles.range,
                        ...(this.props.disabled?styles.disabled:{}),
                        ...this.props.style
                        }}
                    onMouseDown={this.rangeMouseDown.bind(this,false)} 
                    onMouseMove={this.rangeMouseMove.bind(this,false)}
                    onMouseUp={this.rangeMouseUp.bind(this,false)}
                    onTouchStart={this.rangeMouseDown.bind(this,true)}
                    >
                        <div className="semantic_ui_range_inner" ref={(inner) => {this.inner = inner}} 
                        style={
                            {...styles.inner,
                            ...(this.props.vertical?styles.vertical:{}),
                            ...(this.props.vertical?{"height":"200px"}:{}),
                            ...(this.props.vertical?{"marginTop":this.verticalOffset+200+"px"}:{})
                        }
                    } >
                            <div style={
                                {...styles.track,
                                 ...(this.props.inverted?styles.invertedTrack:{})
                                }}
                            ></div>
                            <div ref={(trackFill) => {this.trackFill = trackFill}} style={
                                {...styles.trackFill,
                                 ...(this.props.inverted?styles.invertedTrackFill:{}),
                                 ...{width: (this.state.position+this.state.offset)+"px"},
                                 ...styles[this.props.inverted?"inverted-"+this.props.color:this.props.color],
                                 ...(this.props.disabled?styles.disabledTrackFill:{})
                                }}
                            ></div>
                            <div style={
                                {...styles.thumb,
                                 ...{left: this.state.position+"px"}
                                }}>
                            </div>
                        </div>
                </div>
            </div>
        );
    }


}

Slider.defaultProps = {
    color: 'red',
    settings: {
        min: 0,
        max: 10,
        step: 1,
        start: 0,
    }
} 

Slider.propTypes = {
    settings: PropTypes.shape({
        min: PropTypes.number,
        max: PropTypes.number,
        step: PropTypes.number,
        start: PropTypes.number,
        onChange: PropTypes.func
    }),
    color: PropTypes.string,
    inverted: PropTypes.bool
}
