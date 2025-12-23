import { useState } from "react";
import CreateEventForm from "@/components/ui/CreateEventForm";
import AccessEventForm from "@/components/ui/AccessEventForm";
import {SwitchTransition, CSSTransition} from "react-transition-group";
import {useTranslation} from "react-i18next";
import { useRef } from "react";
import "../fade.css";

const HomePage = () => {
  const [showCreateEvent, setShowCreateEvent] = useState(true);
  const {t} = useTranslation();
  const nodeRef = useRef(null);
  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <div className=" mt-40 mb-4">
        
            <button
          onClick={() => setShowCreateEvent(true)}
          className={`px-4 py-2 rounded-l-md ${showCreateEvent ? 'bg-gray-900 text-white' : 'bg-gray-300'}`}>
                {t("creation")}
        </button>
        <button
          onClick={() => setShowCreateEvent(false)}
          className={`px-4 py-2 rounded-r-md ${!showCreateEvent ? 'bg-gray-900 text-white' : 'bg-gray-300'}`}>
            {t("access")}
        </button>
      </div>

      <SwitchTransition>
        <CSSTransition
          key={showCreateEvent ? "create" : "access"}
          timeout={300}
          nodeRef={nodeRef}
          classNames="fade"
        >
      <div ref={nodeRef}>
        {showCreateEvent ? <CreateEventForm /> : <AccessEventForm />}
      </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
};

export default HomePage;
