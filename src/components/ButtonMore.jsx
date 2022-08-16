import { StyledButtonLarge } from "../StyledComponents";
import { IconMore } from "./icons/IconMore";

export const ButtonMore = ({ onMoreRequest }) => {
    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            <StyledButtonLarge onClick={onMoreRequest}>
                <span style={{ verticalAlign: "top", marginRight: "5px" }}>More</span>
                <IconMore />
            </StyledButtonLarge>
        </div>
    );
};