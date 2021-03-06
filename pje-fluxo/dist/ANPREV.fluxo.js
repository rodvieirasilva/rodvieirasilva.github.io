var ANPREV_fluxo = 
`<?xml version="1.0" encoding="UTF-8"?>
<process-definition xmlns="urn:jbpm.org:jpdl-3.2" name="Análise de prevenção"> 
    <!-- SWIMLANES -->
    <swimlane name="Distribuição">
        <assignment pooled-actors="#{localizacaoAssignment.getPooledActors('192:5859,193:5921,193:5920,1:1,345378:1')}" actor-id="#{actor.id}"/>
    </swimlane>
    <swimlane name="Nó de Desvio - Análise de prevenção">
        <assignment pooled-actors="#{localizacaoAssignment.getPooledActors('192:5859,345378:1')}"/>
    </swimlane>  
    <!-- START-STATE -->
    <start-state name="Início">
        <task name="Tarefa inicial" swimlane="Distribuição" priority="3"/>
        <transition to="Desloca fluxo para distribuição" name="Desloca fluxo para distribuição"/>
    </start-state>  
    <!-- NODES -->
    <node name="Desloca fluxo para distribuição">
        <transition to="Testa devolução do plantão Judicial" name="Testa devolução do plantão Judicial"/>
        <event type="node-leave">
            <action expression="#{tramitacaoProcessualService.gravaVariavel('pje:fluxo:deslocamento:colegiadoDestino', 22)}"/>
            <action expression="#{tramitacaoProcessualService.gravaVariavel('pje:fluxo:deslocamento:orgaoDestino', 38)}"/>
            <action expression="#{tramitacaoProcessualService.gravaVariavel('pje:fluxo:deslocamento:orgaoCargoDestino', 0)}"/>
            <action expression="#{tramitacaoProcessualService.deslocarFluxoParaOrgaoDiverso()}"/>
            <action expression="#{preencherMovimento.deCodigo(123).comComplementoDeCodigo(20).doTipoDinamico().preencherComObjeto(tramitacaoProcessualService.recuperaProcesso().orgaoJulgador).comComplementoDeCodigo(18).doTipoDominio().preencherComElementoDeCodigo(37).comComplementoDeCodigo(7).doTipoLivre().preencherComTexto('UFOR').lancarMovimento()}"/>
        </event>
    </node>
    <decision expression="#{(org.jboss.seam.bpm.processInstance.contextInstance.getVariable('RemessaUFOR')) ? 'T1' : 'T2'}" name="Testa devolução do plantão Judicial">
        <transition to="Recebidos após apreciação pelo plantão" name="T1"/>
        <transition to="Testa processo originário" name="T2"/>
        <event type="node-leave">
            <action name="upd" expression="#{tramitacaoProcessualService.gravaVariavel('RemessaUFOR', 'false')}"/>
        </event>
    </decision>
    <decision expression="#{tramitacaoProcessualService.recuperaProcesso().numeroOrigem == 0000? 'Testa prioridade originários' : 'Testa recurso federal ou estadual'}" name="Testa processo originário">
        <transition to="Testa recurso federal ou estadual" name="Testa recurso federal ou estadual"/>
        <transition to="Testa prioridade originários" name="Testa prioridade originários"/>
    </decision>
    <decision expression="#{tramitacaoProcessualService.recuperaProcesso().getPrioridadeProcessoList().isEmpty() ? 'T1' : 'T2'}" name="Testa prioridade originários">
        <transition to="Análise da distribuição - processos originários" name="T1"/>
        <transition to="Análise da distribuição - originários prioridade" name="T2"/>
    </decision>
    <decision expression="#{tramitacaoProcessualService.recuperaProcesso().numeroOrigem == 9999? 'Testa prioridade recurso estadual' : 'Testa prioridade recurso federal'}" name="Testa recurso federal ou estadual">
        <transition to="Testa prioridade recurso estadual" name="Testa prioridade recurso estadual"/>
        <transition to="Testa prioridade recurso federal" name="Testa prioridade recurso federal"/>
    </decision>
    <decision expression="#{tramitacaoProcessualService.recuperaProcesso().getPrioridadeProcessoList().isEmpty() ? 'T1' : 'T2'}" name="Testa prioridade recurso estadual">
        <transition to="Análise da distribuição - recursos estaduais" name="T1"/>
        <transition to="Análise da distribuição - recursos estaduais prioridade" name="T2"/>
    </decision>
    <decision expression="#{tramitacaoProcessualService.recuperaProcesso().getPrioridadeProcessoList().isEmpty() ? 'T1' : 'T2'}" name="Testa prioridade recurso federal">
        <transition to="Análise da distribuição - recursos federais " name="T1"/>
        <transition to="Análise da distribuição - recursos federias prioridade" name="T2"/>
    </decision>
    <task-node end-tasks="true" name="Análise da distribuição - processos originários">
        <task name="Análise da distribuição - processos originários" swimlane="Distribuição" priority="3">
            <controller>
                <variable name="anprev_mandadoSeguranca" mapped-name="sim_nao:anprev_mandadoSeguranca" access="read,write"/>
                <variable name="anprev_processoConciliacao" mapped-name="sim_nao:anprev_processoConciliacao" access="read,write"/>
            </controller>
        </task>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Retornar fluxo para órgão julgador" name="Remeter ao gabinete"/>
        <transition to="Retificar autuação - Análise da distribuição" name="Retificar autuação"/>
        <transition to="Redistribuir - Análise da distribuição" name="Redistribuir"/>
        <transition to="Remeter ao plantão presencial - Recesso" name="Remeter ao plantão presencial - Recesso">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Remeter ao Plantão Judicial - Final de Semana" name="Remeter ao Plantão Judicial - Final de Semana">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
        <transition to="Apaga variáveis de minuta" name="Preparar certidão"/>
        <transition to="Refazer pesquisa de prevenção" name="Refazer pesquisa de prevenção"/>
        <transition to="Remessa ao Fluxo Principal" name="Remessa ao Fluxo Principal">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
    </task-node>
    <task-node end-tasks="true" name="Análise da distribuição - originários prioridade">
        <task name="Análise da distribuição - originários prioridade" swimlane="Distribuição" priority="3">
            <controller>
                <variable name="anprev_mandadoSeguranca" mapped-name="sim_nao:anprev_mandadoSeguranca" access="read,write"/>
                <variable name="anprev_processoConciliacao" mapped-name="sim_nao:anprev_processoConciliacao" access="read,write"/>
            </controller>
        </task>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Retornar fluxo para órgão julgador" name="Remeter ao gabinete"/>
        <transition to="Retificar autuação - Análise da distribuição" name="Retificar autuação"/>
        <transition to="Redistribuir - Análise da distribuição" name="Redistribuir"/>
        <transition to="Remeter ao plantão presencial - Recesso" name="Remeter ao plantão presencial - Recesso">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Remeter ao Plantão Judicial - Final de Semana" name="Remeter ao Plantão Judicial - Final de Semana">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
        <transition to="Apaga variáveis de minuta" name="Preparar certidão"/>
        <transition to="Refazer pesquisa de prevenção" name="Refazer pesquisa de prevenção"/>
        <transition to="Remessa ao Fluxo Principal" name="Remessa ao Fluxo Principal">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
    </task-node>
    <task-node end-tasks="true" name="Análise da distribuição - recursos federais ">
        <task name="Análise da distribuição - recursos federais " swimlane="Distribuição" priority="3">
            <controller>
                <variable name="anprev_mandadoSeguranca" mapped-name="sim_nao:anprev_mandadoSeguranca" access="read,write"/>
                <variable name="anprev_processoConciliacao" mapped-name="sim_nao:anprev_processoConciliacao" access="read,write"/>
            </controller>
        </task>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Retornar fluxo para órgão julgador" name="Remeter ao gabinete"/>
        <transition to="Retificar autuação - Análise da distribuição" name="Retificar autuação"/>
        <transition to="Redistribuir - Análise da distribuição" name="Redistribuir"/>
        <transition to="Remeter ao plantão presencial - Recesso" name="Remeter ao plantão presencial - Recesso">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Devolver processo a pedido da Vara Federal" name="Devolver processo a pedido da Vara Federal"/>
        <transition to="Remeter ao Plantão Judicial - Final de Semana" name="Remeter ao Plantão Judicial - Final de Semana">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
        <transition to="Apaga variáveis de minuta" name="Preparar certidão"/>
        <transition to="Refazer pesquisa de prevenção" name="Refazer pesquisa de prevenção"/>
        <transition to="Remessa ao Fluxo Principal" name="Remessa ao Fluxo Principal">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
    </task-node>
    <task-node end-tasks="true" name="Análise da distribuição - recursos federias prioridade">
        <task name="Análise da distribuição - recursos federias prioridade" swimlane="Distribuição" priority="3">
            <controller>
                <variable name="anprev_mandadoSeguranca" mapped-name="sim_nao:anprev_mandadoSeguranca" access="read,write"/>
                <variable name="anprev_processoConciliacao" mapped-name="sim_nao:anprev_processoConciliacao" access="read,write"/>
            </controller>
        </task>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Retornar fluxo para órgão julgador" name="Remeter ao gabinete"/>
        <transition to="Retificar autuação - Análise da distribuição" name="Retificar autuação"/>
        <transition to="Redistribuir - Análise da distribuição" name="Redistribuir"/>
        <transition to="Remeter ao plantão presencial - Recesso" name="Remeter ao plantão presencial - Recesso">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Devolver processo a pedido da Vara Federal" name="Devolver processo a pedido da Vara Federal"/>
        <transition to="Remeter ao Plantão Judicial - Final de Semana" name="Remeter ao Plantão Judicial - Final de Semana">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
        <transition to="Apaga variáveis de minuta" name="Preparar certidão"/>
        <transition to="Refazer pesquisa de prevenção" name="Refazer pesquisa de prevenção"/>
        <transition to="Remessa ao Fluxo Principal" name="Remessa ao Fluxo Principal">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
    </task-node>
    <task-node end-tasks="true" name="Análise da distribuição - recursos estaduais">
        <task name="Análise da distribuição - recursos estaduais" swimlane="Distribuição" priority="3">
            <controller>
                <variable name="anprev_mandadoSeguranca" mapped-name="sim_nao:anprev_mandadoSeguranca" access="read,write"/>
                <variable name="anprev_processoConciliacao" mapped-name="sim_nao:anprev_processoConciliacao" access="read,write"/>
            </controller>
        </task>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Retornar fluxo para órgão julgador" name="Remeter ao gabinete"/>
        <transition to="Retificar autuação - Análise da distribuição" name="Retificar autuação"/>
        <transition to="Redistribuir - Análise da distribuição" name="Redistribuir"/>
        <transition to="Remeter ao plantão presencial - Recesso" name="Remeter ao plantão presencial - Recesso">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Remeter ao Plantão Judicial - Final de Semana" name="Remeter ao Plantão Judicial - Final de Semana">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
        <transition to="Apaga variáveis de minuta" name="Preparar certidão"/>
        <transition to="Refazer pesquisa de prevenção" name="Refazer pesquisa de prevenção"/>
        <transition to="Remessa ao Fluxo Principal" name="Remessa ao Fluxo Principal">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
    </task-node>
    <task-node end-tasks="true" name="Análise da distribuição - recursos estaduais prioridade">
        <task name="Análise da distribuição - recursos estaduais prioridade" swimlane="Distribuição" priority="3">
            <controller>
                <variable name="anprev_mandadoSeguranca" mapped-name="sim_nao:anprev_mandadoSeguranca" access="read,write"/>
                <variable name="anprev_processoConciliacao" mapped-name="sim_nao:anprev_processoConciliacao" access="read,write"/>
            </controller>
        </task>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Retornar fluxo para órgão julgador" name="Remeter ao gabinete"/>
        <transition to="Retificar autuação - Análise da distribuição" name="Retificar autuação"/>
        <transition to="Redistribuir - Análise da distribuição" name="Redistribuir"/>
        <transition to="Remeter ao plantão presencial - Recesso" name="Remeter ao plantão presencial - Recesso">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Remeter ao Plantão Judicial - Final de Semana" name="Remeter ao Plantão Judicial - Final de Semana">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
        <transition to="Apaga variáveis de minuta" name="Preparar certidão"/>
        <transition to="Refazer pesquisa de prevenção" name="Refazer pesquisa de prevenção"/>
        <transition to="Remessa ao Fluxo Principal" name="Remessa ao Fluxo Principal">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
    </task-node>
    <decision expression="#{competenciaClasseAssuntoHome.processoContemClasseAssunto('198:50250') ? 'Análise da distribuição - Assunto TJ-SP' : 'Testa assunto genérico TJ-SP - Apelação e Reexame'}" name="Testa assunto genérico TJ-SP - Apelação">
        <transition to="Análise da distribuição - Assunto TJ-SP" name="Análise da distribuição - Assunto TJ-SP"/>
        <transition to="Testa assunto genérico TJ-SP - Apelação e Reexame" name="Testa assunto genérico TJ-SP - Apelação e Reexame"/>
    </decision>
    <decision expression="#{competenciaClasseAssuntoHome.processoContemClasseAssunto('1728:50250') ? 'Análise da distribuição - Assunto TJ-SP' : 'Testa assunto genérico TJ-SP - Reexame'}" name="Testa assunto genérico TJ-SP - Apelação e Reexame">
        <transition to="Análise da distribuição - Assunto TJ-SP" name="Análise da distribuição - Assunto TJ-SP"/>
        <transition to="Testa assunto genérico TJ-SP - Reexame" name="Testa assunto genérico TJ-SP - Reexame"/>
    </decision>
    <decision expression="#{competenciaClasseAssuntoHome.processoContemClasseAssunto('199:50250') ? 'Análise da distribuição - Assunto TJ-SP' : 'Análise da distribuição'}" name="Testa assunto genérico TJ-SP - Reexame">
        <transition to="Análise da distribuição - Assunto TJ-SP" name="Análise da distribuição - Assunto TJ-SP"/>
        <transition to="Análise da distribuição" name="Análise da distribuição"/>
    </decision>
    <task-node end-tasks="true" name="Análise da distribuição - Assunto TJ-SP">
        <task name="Análise da distribuição - Assunto TJ-SP" swimlane="Distribuição" priority="3"/>
        <transition to="Retificar autuação - Análise da distribuição" name="Retificar autuação - Análise da distribuição"/>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
    </task-node>
    <task-node end-tasks="true" name="Recebidos após apreciação pelo plantão">
        <task name="Recebidos após apreciação pelo plantão" swimlane="Distribuição" priority="3"/>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Análise da distribuição" name="Encaminhar para análise da distribuição"/>
    </task-node>
    <task-node end-tasks="true" name="Análise da distribuição">
        <task name="Análise da distribuição" swimlane="Distribuição" priority="3">
            <controller>
                <variable name="anprev_mandadoSeguranca" mapped-name="sim_nao:anprev_mandadoSeguranca" access="read,write"/>
                <variable name="anprev_processoConciliacao" mapped-name="sim_nao:anprev_processoConciliacao" access="read,write"/>
            </controller>
        </task>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Retornar fluxo para órgão julgador" name="Remeter ao gabinete"/>
        <transition to="Retificar autuação - Análise da distribuição" name="Retificar autuação"/>
        <transition to="Redistribuir - Análise da distribuição" name="Redistribuir"/>
        <transition to="Remeter ao plantão presencial - Recesso" name="Remeter ao plantão presencial - Recesso"/>
        <transition to="Devolver processo a pedido da Vara Federal" name="Devolver processo a pedido da Vara Federal"/>
        <transition to="Remeter ao Plantão Judicial - Final de Semana" name="Remeter ao Plantão Judicial - Sobreaviso"/>
        <transition to="Apaga variáveis de minuta" name="Preparar certidão"/>
        <transition to="Refazer pesquisa de prevenção" name="Refazer pesquisa de prevenção"/>
        <transition to="Remessa ao Fluxo Principal" name="Remessa ao Fluxo Principal">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
        <event type="task-end">
            <action expression="#{org.jboss.seam.bpm.processInstance.contextInstance.setVariable('anprev:mandadoSeguranca', org.jboss.seam.bpm.taskInstance.getVariable('sim_nao:anprev_mandadoSeguranca'))}"/>
            <action expression="#{org.jboss.seam.bpm.processInstance.contextInstance.setVariable('anprev:processoConciliacao', org.jboss.seam.bpm.taskInstance.getVariable('sim_nao:anprev_processoConciliacao'))}"/>
        </event>
    </task-node>
    <process-state name="Remessa ao Fluxo Principal">
        <sub-process name="Fluxo básico do 2º grau" binding="late"/>
    </process-state>
    <process-state name="Refazer pesquisa de prevenção">
        <sub-process name="Fluxo de pesquisa de prevenção" binding="late"/>
        <transition to="Análise da distribuição" name="Análise da distribuição"/>
    </process-state>
    <node name="Apaga variáveis de minuta">
        <transition to="Minutar certidão da distribuição" name="Minutar certidão da distribuição"/>
        <event type="node-enter">
            <action expression="#{org.jboss.seam.bpm.processInstance.contextInstance.deleteVariable('minutaEmElaboracao')}"/>
            <action expression="#{tramitacaoProcessualService.apagaVariavelTarefa('textEditCombo:Minutar_ato')}"/>
            <action expression="#{org.jboss.seam.bpm.processInstance.contextInstance.deleteVariable('Minutar_ato')}"/>
            <action expression="#{org.jboss.seam.bpm.processInstance.contextInstance.deleteVariable('minuta_outrosdocumentos')}"/>
        </event>
    </node>
    <process-state name="Remeter ao Plantão Judicial - Final de Semana">
        <sub-process name="Fluxo básico do plantão do 2º grau - Final de semana" binding="late"/>
        <transition to="Desloca fluxo para distribuição após devolução do plantão" name="Desloca fluxo para distribuição após devolução do plantão"/>
    </process-state>
    <process-state name="Devolver processo a pedido da Vara Federal">
        <sub-process name="Remessa para 1º grau - UFOR" binding="late"/>
        <transition to="Análise da distribuição" name="Análise da distribuição"/>
    </process-state>
    <process-state name="Remeter ao plantão presencial - Recesso">
        <sub-process name="Fluxo básico do plantão do 2º grau" binding="late"/>
        <transition to="Desloca fluxo para distribuição após devolução do plantão" name="Desloca fluxo para distribuição após devolução do plantão"/>
    </process-state>
    <node name="Desloca fluxo para distribuição após devolução do plantão">
        <transition to="Recebidos após apreciação pelo plantão" name="Recebidos após apreciação pelo plantão"/>
        <event type="node-leave">
            <action expression="#{tramitacaoProcessualService.gravaVariavel('pje:fluxo:deslocamento:colegiadoDestino', 22)}"/>
            <action expression="#{tramitacaoProcessualService.gravaVariavel('pje:fluxo:deslocamento:orgaoDestino', 38)}"/>
            <action expression="#{tramitacaoProcessualService.gravaVariavel('pje:fluxo:deslocamento:orgaoCargoDestino', 0)}"/>
            <action expression="#{tramitacaoProcessualService.deslocarFluxoParaOrgaoDiverso()}"/>
            <action expression="#{preencherMovimento.deCodigo(123).comComplementoDeCodigo(20).doTipoDinamico().preencherComObjeto(tramitacaoProcessualService.recuperaProcesso().orgaoJulgador).comComplementoDeCodigo(18).doTipoDominio().preencherComElementoDeCodigo(37).comComplementoDeCodigo(7).doTipoLivre().preencherComTexto('UFOR').lancarMovimento()}"/>
        </event>
    </node>
    <task-node end-tasks="true" name="Redistribuir - Análise da distribuição">
        <task name="Redistribuir - Análise da distribuição" swimlane="Distribuição" priority="3">
            <controller>
                <variable name="Processo_Fluxo_abaRedistribuicaoProcesso" mapped-name="frame:Processo_Fluxo_abaRedistribuicaoProcesso" access="read,write"/>
            </controller>
        </task>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Registrar evento de redistribuição" name="Registrar evento de redistribuição">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Análise da distribuição" name="Retornar para análise da distribuição"/>
        <event type="task-start">
            <action name="upd" expression="#{tramitacaoProcessualService.gravaVariavelTarefa('pje:fluxo:transicao:dispensaRequeridos', 'Retornar para análise da distribuição')}"/>
        </event>
        <event type="task-create">
            <action name="upd" expression="#{taskInstanceUtil.setFrameDefaultTransition('Registrar evento de redistribuição')}"/>
        </event>
        <event type="node-leave">
            <action name="upd" expression="#{org.jboss.seam.bpm.processInstance.contextInstance.setVariable('processoRedistribuido', true)}"/>
        </event>
    </task-node>
    <node name="Registrar evento de redistribuição">
        <transition to="Avaliar providências posteriores à redistribuição" name="Avaliar providências posteriores à redistribuição"/>
        <event type="node-enter">
            <action name="upd" expression="#{org.jboss.seam.bpm.processInstance.contextInstance.setVariable('pje:processoRedistribuido', 'true')}"/>
        </event>
    </node>
    <task-node end-tasks="true" name="Avaliar providências posteriores à redistribuição">
        <task name="Avaliar providências posteriores à redistribuição" swimlane="Distribuição" priority="3"/>
        <transition to="Retornar fluxo para órgão julgador" name="Remeter ao gabinete"/>
        <transition to="Redistribuir - Análise da distribuição" name="Redistribuir"/>
        <transition to="Minutar certidão da distribuição" name="Preparar certidão"/>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <event type="node-leave">
            <action name="upd" expression="#{tramitacaoProcessualService.gravaVariavel('pje:fluxo:deslocamento:colegiadoDestino', 22)}"/>
            <action name="upd" expression="#{tramitacaoProcessualService.gravaVariavel('pje:fluxo:deslocamento:orgaoDestino', 38)}"/>
            <action name="upd" expression="#{tramitacaoProcessualService.gravaVariavel('pje:fluxo:deslocamento:orgaoCargoDestino', 0)}"/>
            <action name="upd" expression="#{tramitacaoProcessualService.deslocarFluxoParaOrgaoDiverso()}"/>
        </event>
    </task-node>
    <task-node end-tasks="true" name="Retificar autuação - Análise da distribuição">
        <task name="Retificar autuação - Análise da distribuição" swimlane="Distribuição" priority="3">
            <controller>
                <variable name="Processo_RetificacaoAutuacao_updateRetificacaoAutuacao" mapped-name="page:Processo_RetificacaoAutuacao_updateRetificacaoAutuacao" access="read,write"/>
            </controller>
        </task>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Análise da distribuição" name="Retornar para análise da distribuição"/>
        <transition to="Refazer pesquisa de prevenção" name="Refazer pesquisa de prevenção"/>
        <event type="task-create">
            <action name="upd" expression="#{tramitacaoProcessualService.gravaVariavelTarefa('pageParam','idProcesso='.concat(tramitacaoProcessualService.recuperaProcesso().idProcessoTrf))}"/>
        </event>
    </task-node>
    <task-node end-tasks="true" name="Minutar certidão da distribuição">
        <task name="Minutar certidão da distribuição" swimlane="Distribuição" priority="3">
            <controller>
                <variable name="minuta_outrosdocumentos" mapped-name="textEditCombo:minuta_outrosdocumentos" access="read,write"/>
                <variable name="MinutarEmLote" mapped-name="minutarLote:MinutarEmLote" access="read,write"/>
            </controller>
        </task>
        <transition to="Assinar certidão da distribuição" name="Encaminhar para assinatura"/>
        <transition to="Análise da distribuição" name="Retornar para análise da distribuição"/>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <event type="task-start">
            <action name="upd" expression="#{tramitacaoProcessualService.gravaVariavelTarefa('tiposDisponiveisIds','57,114')}"/>
            <action name="upd" expression="#{tipoDocumento.set('Minutar_ato',57,114)}"/>
            <action name="upd" expression="#{tramitacaoProcessualService.gravaVariavelTarefa('pje:fluxo:transicao:dispensaRequeridos', 'Retornar para análise da distribuição')}"/>
            <action name="Condicao do lancamento temporario de movimentos" expression="#{lancadorMovimentosService.setCondicaoLancamentoMovimentosTemporarioNoFluxo('#{true}')}"/>
        </event>
        <event type="node-leave">
            <action name="upd" expression="#{not empty processoHome.idProcessoDocumento ? org.jboss.seam.bpm.processInstance.contextInstance.setVariable('minutaEmElaboracao', processoHome.idProcessoDocumento) : ''}"/>
        </event>
    </task-node>
    <task-node end-tasks="true" name="Assinar certidão da distribuição">
        <task name="Assinar certidão da distribuição" swimlane="Distribuição" priority="4">
            <controller>
                <variable name="Processo_Fluxo_revisarMinuta" mapped-name="frame:Processo_Fluxo_revisarMinuta" access="read,write"/>
                <variable name="AssinaturaEmLote" mapped-name="assinarLote:AssinaturaEmLote" access="read,write"/>
            </controller>
        </task>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Minutar certidão da distribuição" name="Retornar para minutar certidão"/>
        <transition to="Análise da distribuição" name="Análise da distribuição"/>
        <event type="task-start">
            <action expression="#{tramitacaoProcessualService.gravaVariavelTarefa('tiposDisponiveisIds','57,114')}"/>
            <action name="upd" expression="#{tramitacaoProcessualService.gravaVariavelTarefa('pje:fluxo:transicao:dispensaRequeridos', 'Retornar para minutar certidão')}"/>
            <action expression="#{lancadorMovimentosService.setCondicaoLancamentoMovimentosTemporarioNoFluxo('#{false}')}"/>
        </event>
        <event type="task-create">
            <action expression="#{taskInstanceUtil.setFrameDefaultTransition('Análise da distribuição')}"/>
        </event>
    </task-node>
    <node name="Retornar fluxo para órgão julgador">
        <transition to="Término" name="Término"/>
        <event type="node-leave">
            <action expression="#{tramitacaoProcessualService.deslocarFluxoParaOrgaoDiverso()}"/>
        </event>
        <event type="node-enter">
            <action expression="#{tramitacaoProcessualService.apagaVariavel('pje:fluxo:deslocamento:colegiadoDestino')}"/>
            <action expression="#{tramitacaoProcessualService.apagaVariavel('pje:fluxo:deslocamento:orgaoDestino')}"/>
            <action expression="#{tramitacaoProcessualService.apagaVariavel('pje:fluxo:deslocamento:orgaoCargoDestino')}"/>
        </event>
    </node>
    <end-state name="Término"/>
    <task-node end-tasks="true" name="Nó de Desvio - Análise de prevenção">
        <task name="Nó de Desvio - Análise de prevenção" swimlane="Nó de Desvio - Análise de prevenção" priority="3"/>
        <transition to="Término" name="Término"/>
        <transition to="Análise da distribuição" name="Análise da distribuição"/>
        <transition to="Assinar certidão da distribuição" name="Assinar certidão da distribuição"/>
        <transition to="Retornar fluxo para órgão julgador" name="Retornar fluxo para órgão julgador"/>
        <transition to="Minutar certidão da distribuição" name="Minutar certidão da distribuição"/>
        <transition to="Redistribuir - Análise da distribuição" name="Redistribuir - Análise da distribuição"/>
        <transition to="Retificar autuação - Análise da distribuição" name="Retificar autuação - Análise da distribuição"/>
        <transition to="Avaliar providências posteriores à redistribuição" name="Avaliar providências posteriores à redistribuição"/>
        <transition to="Recebidos após apreciação pelo plantão" name="Recebidos após apreciação pelo plantão"/>
        <transition to="Análise da distribuição - Assunto TJ-SP" name="Análise da distribuição - Assunto TJ-SP"/>
        <transition to="Análise da distribuição - processos originários" name="Análise da distribuição - processos originários"/>
        <transition to="Análise da distribuição - recursos federais " name="Análise da distribuição - recursos federais "/>
        <transition to="Análise da distribuição - recursos estaduais" name="Análise da distribuição - recursos estaduais"/>
        <transition to="Análise da distribuição - originários prioridade" name="Análise da distribuição - originários prioridade"/>
        <transition to="Análise da distribuição - recursos federias prioridade" name="Análise da distribuição - recursos federias prioridade"/>
        <transition to="Análise da distribuição - recursos estaduais prioridade" name="Análise da distribuição - recursos estaduais prioridade"/>
        <transition to="Processos já analisados" name="Processos já analisados"/>
    </task-node>
    <task-node end-tasks="true" name="Processos já analisados">
        <task name="Processos já analisados" swimlane="Distribuição" priority="3">
            <controller>
                <variable name="anprev_mandadoSeguranca" mapped-name="sim_nao:anprev_mandadoSeguranca" access="read,write"/>
                <variable name="anprev_processoConciliacao" mapped-name="sim_nao:anprev_processoConciliacao" access="read,write"/>
            </controller>
        </task>
        <transition to="Nó de Desvio - Análise de prevenção" name="Nó de Desvio - Análise de prevenção">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Retornar fluxo para órgão julgador" name="Remeter ao gabinete"/>
        <transition to="Retificar autuação - Análise da distribuição" name="Retificar autuação"/>
        <transition to="Redistribuir - Análise da distribuição" name="Redistribuir"/>
        <transition to="Remeter ao plantão presencial - Recesso" name="Remeter ao plantão presencial - Recesso">
            <condition expression="#{true}"/>
        </transition>
        <transition to="Devolver processo a pedido da Vara Federal" name="Devolver processo a pedido da Vara Federal"/>
        <transition to="Remeter ao Plantão Judicial - Final de Semana" name="Remeter ao Plantão Judicial - Final de Semana">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
        <transition to="Apaga variáveis de minuta" name="Preparar certidão"/>
        <transition to="Refazer pesquisa de prevenção" name="Refazer pesquisa de prevenção"/>
        <transition to="Remessa ao Fluxo Principal" name="Remessa ao Fluxo Principal">
            <condition expression="#{org.jboss.seam.security.identity.hasRole('admin')}"/>
        </transition>
    </task-node>  
    <!-- PROCESS-EVENTS -->
    <event type="superstate-enter">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="process-start">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="before-signal">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="task-end">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="subprocess-created">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="task-create">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="transition">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="task-assign">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="after-signal">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="timer">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="task-start">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="subprocess-end">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="node-leave">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="process-end">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="superstate-leave">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>
    <event type="node-enter">
        <script>br.com.infox.ibpm.util.JbpmEvents.raiseEvent(executionContext)</script>
    </event>  
    <!-- ACTIONS --> 
</process-definition>
`

var parser = new DOMParser();
var xmlDoc = parser.parseFromString(ANPREV_fluxo,"text/xml");